import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(private configService?: ConfigService) {
    const databaseUrl = configService?.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

    const maxConnections = Number(
      configService?.get<string>('DATABASE_POOL_MAX') ||
      process.env.DATABASE_POOL_MAX ||
      (process.env.NODE_ENV === 'production' ? '20' : '10'),
    );

    const idleTimeoutMillis = Number(
      configService?.get<string>('DATABASE_POOL_IDLE_TIMEOUT_MS') ||
      process.env.DATABASE_POOL_IDLE_TIMEOUT_MS ||
      '30000',
    );

    const connectionTimeoutMillis = Number(
      configService?.get<string>('DATABASE_POOL_CONN_TIMEOUT_MS') ||
      process.env.DATABASE_POOL_CONN_TIMEOUT_MS ||
      '5000',
    );

    const pool = new Pool({
      connectionString: databaseUrl,
      max: maxConnections,
      idleTimeoutMillis,
      connectionTimeoutMillis,
    });

    pool.on('error', (err) => {
      new Logger(PrismaService.name).error(`Unexpected error on idle PostgreSQL client: ${err.message}`, err.stack);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('PrismaClient connected with optimized pg.Pool');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this.pool) {
      await this.pool.end();
      this.logger.log('PostgreSQL connection pool drained');
    }
  }

  getPoolMetrics() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}
