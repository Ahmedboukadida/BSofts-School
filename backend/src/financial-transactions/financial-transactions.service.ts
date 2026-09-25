import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, QueryTransactionDto } from './financial-transaction.dto';
import { PaginatedDto } from '../common/pagination.dto';
import { FinancialTransactionEntity } from './financial-transaction.entity';

@Injectable()
export class FinancialTransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryTransactionDto) {
    const { page = 1, limit = 10, caisseId, type, category, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (caisseId) where.caisseId = caisseId;
    if (type) where.type = type;
    if (category) where.category = category;

    const orderBy: any = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where, skip, take: limit, orderBy,
        include: { caisse: { select: { id: true, name: true } } },
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);

    const entities = data.map((item) => new FinancialTransactionEntity({ ...item, amount: Number(item.amount), balance: Number(item.balance) }));
    return new PaginatedDto(entities, total, page, limit);
  }

  async findOne(id: string) {
    const transaction = await this.prisma.financialTransaction.findUnique({
      where: { id },
      include: { caisse: true },
    });
    if (!transaction) throw new NotFoundException(`Transaction with ID ${id} not found`);
    return new FinancialTransactionEntity({ ...transaction, amount: Number(transaction.amount), balance: Number(transaction.balance) });
  }

  async create(dto: CreateTransactionDto, user?: any) {
    const caisse = await this.prisma.caisse.findUnique({ where: { id: dto.caisseId } });
    if (!caisse) throw new NotFoundException(`Caisse with ID ${dto.caisseId} not found`);

    let newBalance = Number(caisse.balance);
    if (dto.type === 'INCOME' || dto.type === 'REFUND' || dto.type === 'PENALTY') {
      newBalance += dto.amount;
    } else if (dto.type === 'EXPENSE') {
      newBalance -= dto.amount;
      if (newBalance < 0) throw new BadRequestException('Insufficient balance');
    } else if (dto.type === 'TRANSFER') {
      console.warn('TRANSFER type does not update caisse balance automatically');
    }

    try {
      const [transaction] = await this.prisma.$transaction([
        this.prisma.financialTransaction.create({
          data: {
            caisseId: dto.caisseId,
            type: dto.type as TransactionType,
            amount: dto.amount,
            balance: newBalance,
            category: dto.category,
            description: dto.description,
            referenceId: dto.referenceId,
            referenceType: dto.referenceType,
            performedBy: user?.username || dto.performedBy,
          },
        }),
        this.prisma.caisse.update({
          where: { id: dto.caisseId },
          data: { balance: newBalance },
        }),
      ]);

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'CREATE_TRANSACTION',
          entity: 'FinancialTransaction',
          entityId: transaction.id,
          status: 'SUCCESS',
          newValues: transaction as unknown as Prisma.InputJsonValue,
        },
      });

      return new FinancialTransactionEntity({ ...transaction, amount: Number(transaction.amount), balance: Number(transaction.balance) });
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed to create financial transaction: ${err.message}`,
          stack: err.stack,
          context: 'FinancialTransactionsService.create',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async transferBetweenCaisses(dto: {
    fromCaisseId: string;
    toCaisseId: string;
    amount: number;
    description?: string;
    performedBy?: string;
  }, user?: any) {
    if (dto.fromCaisseId === dto.toCaisseId) {
      throw new BadRequestException('La caisse source et la caisse destination doivent être différentes.');
    }
    if (dto.amount <= 0) {
      throw new BadRequestException('Le montant du transfert doit être supérieur à zéro.');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const fromCaisse = await tx.caisse.findUnique({ where: { id: dto.fromCaisseId } });
        const toCaisse = await tx.caisse.findUnique({ where: { id: dto.toCaisseId } });

        if (!fromCaisse) throw new NotFoundException('Caisse source introuvable');
        if (!toCaisse) throw new NotFoundException('Caisse destination introuvable');

        const fromBalance = Number(fromCaisse.balance);
        if (fromBalance < dto.amount) {
          throw new BadRequestException(`Solde insuffisant dans "${fromCaisse.name}" (${fromBalance} TND disponible).`);
        }

        const newFromBalance = fromBalance - dto.amount;
        const newToBalance = Number(toCaisse.balance) + dto.amount;

        // 1. Transaction Débit sur la caisse source
        const txFrom = await tx.financialTransaction.create({
          data: {
            caisseId: dto.fromCaisseId,
            type: 'EXPENSE',
            amount: dto.amount,
            balance: newFromBalance,
            category: 'TRANSFER_OUT',
            description: dto.description || `Transfert sortant vers ${toCaisse.name}`,
            performedBy: user?.username || dto.performedBy,
          },
        });

        // 2. Transaction Crédit sur la caisse destination
        const txTo = await tx.financialTransaction.create({
          data: {
            caisseId: dto.toCaisseId,
            type: 'INCOME',
            amount: dto.amount,
            balance: newToBalance,
            category: 'TRANSFER_IN',
            description: dto.description || `Transfert entrant depuis ${fromCaisse.name}`,
            performedBy: user?.username || dto.performedBy,
          },
        });

        // 3. Mise à jour des deux soldes
        await tx.caisse.update({
          where: { id: dto.fromCaisseId },
          data: { balance: newFromBalance },
        });

        await tx.caisse.update({
          where: { id: dto.toCaisseId },
          data: { balance: newToBalance },
        });

        return {
          message: `Transfert de ${dto.amount} TND effectué avec succès de "${fromCaisse.name}" vers "${toCaisse.name}"`,
          from: { id: fromCaisse.id, name: fromCaisse.name, newBalance: newFromBalance },
          to: { id: toCaisse.id, name: toCaisse.name, newBalance: newToBalance },
          transactions: [
            new FinancialTransactionEntity({ ...txFrom, amount: Number(txFrom.amount), balance: Number(txFrom.balance) }),
            new FinancialTransactionEntity({ ...txTo, amount: Number(txTo.amount), balance: Number(txTo.balance) }),
          ],
        };
      });

      const actorSnapshot = user
        ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
        : 'System';

      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          actorSnapshot,
          action: 'TRANSFER_FUNDS',
          entity: 'Caisse',
          entityId: dto.fromCaisseId,
          status: 'SUCCESS',
          newValues: { toCaisseId: dto.toCaisseId, amount: dto.amount },
        },
      });

      return result;
    } catch (err: any) {
      await this.prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Failed fund transfer from ${dto.fromCaisseId} to ${dto.toCaisseId}: ${err.message}`,
          stack: err.stack,
          context: 'FinancialTransactionsService.transferBetweenCaisses',
          userId: user?.id,
        },
      });
      throw err;
    }
  }

  async getSummary(caisseId: string, startDate?: string, endDate?: string) {
    const where: any = { caisseId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [income, expense] = await Promise.all([
      this.prisma.financialTransaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.financialTransaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalIncome: Number(income._sum.amount || 0),
      totalExpense: Number(expense._sum.amount || 0),
      net: Number(income._sum.amount || 0) - Number(expense._sum.amount || 0),
    };
  }
}
