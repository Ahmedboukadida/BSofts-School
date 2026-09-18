import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPlatformSettingDto } from './platform-setting.dto';
import { PlatformSettingEntity } from './platform-setting.entity';

@Injectable()
export class PlatformSettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllAsMap(includePrivate: boolean = false) {
    const where = includePrivate ? {} : { isPublic: true };
    const settings = await this.prisma.platformSetting.findMany({ where });
    const map: Record<string, any> = {};
    for (const s of settings) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }
    return map;
  }

  async findAll() {
    const records = await this.prisma.platformSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return records.map((r) => new PlatformSettingEntity(r));
  }

  async findByKey(key: string) {
    const record = await this.prisma.platformSetting.findUnique({ where: { key } });
    if (!record) throw new NotFoundException(`Platform setting '${key}' not found`);
    return new PlatformSettingEntity(record);
  }

  async upsert(dto: UpsertPlatformSettingDto, user?: any) {
    const record = await this.prisma.platformSetting.upsert({
      where: { key: dto.key },
      update: {
        value: typeof dto.value === 'string' ? dto.value : JSON.stringify(dto.value),
        category: dto.category || 'GENERAL',
        description: dto.description,
        isPublic: dto.isPublic ?? false,
      },
      create: {
        key: dto.key,
        value: typeof dto.value === 'string' ? dto.value : JSON.stringify(dto.value),
        category: dto.category || 'GENERAL',
        description: dto.description,
        isPublic: dto.isPublic ?? false,
      },
    });

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    await this.prisma.auditLog.create({
      data: {
        userId: user?.id,
        actorSnapshot,
        action: 'UPSERT_PLATFORM_SETTING',
        entity: 'PlatformSetting',
        entityId: record.id,
        status: 'SUCCESS',
        newValues: record as any,
      },
    });

    return new PlatformSettingEntity(record);
  }

  async saveBulk(settingsMap: Record<string, any>, user?: any) {
    const results = [];
    for (const [key, value] of Object.entries(settingsMap)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const record = await this.prisma.platformSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: {
          key,
          value: stringValue,
          category: 'GENERAL',
          isPublic: true,
        },
      });
      results.push(record);
    }

    const actorSnapshot = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim()
      : 'System';

    await this.prisma.auditLog.create({
      data: {
        userId: user?.id,
        actorSnapshot,
        action: 'BULK_UPDATE_PLATFORM_SETTINGS',
        entity: 'PlatformSetting',
        entityId: 'BULK',
        status: 'SUCCESS',
        newValues: settingsMap,
      },
    });

    return { message: 'Settings saved successfully', count: results.length };
  }
}
