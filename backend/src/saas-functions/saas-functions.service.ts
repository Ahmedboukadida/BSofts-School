import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import {
  CreateSaaSFunctionDto,
  UpdateSaaSFunctionDto,
  QuerySaaSFunctionDto,
} from './saas-functions.dto';

export interface SaaSFunctionRecord {
  id: string;
  name: string;
  code: string;
  moduleId: string;
  moduleName: string;
  description: string;
  permissions: { id: string; code: string; name: string }[];
  rolesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}

const DEFAULT_FUNCTIONS: SaaSFunctionRecord[] = [
  {
    id: 'fn-academic-students',
    name: 'Gestion des inscriptions & fiches élèves',
    code: 'fn_academic_students',
    moduleId: 'mod-academic',
    moduleName: 'Gestion Pédagogique & Scolarité',
    description: 'Permet de gérer le cycle de vie complet des dossiers élèves, inscriptions, et modifications administratives.',
    permissions: [
      { id: 'p1', code: 'students:read', name: 'Consulter les élèves' },
      { id: 'p2', code: 'students:create', name: 'Inscrire un nouvel élève' },
      { id: 'p3', code: 'students:update', name: 'Modifier fiche élève' },
    ],
    rolesCount: 4,
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'fn-grades-bulletins',
    name: 'Saisie & publication des notes et bulletins',
    code: 'fn_grades_bulletins',
    moduleId: 'mod-academic',
    moduleName: 'Gestion Pédagogique & Scolarité',
    description: 'Saisie dématérialisée des notes d’examens, calculs automatiques des moyennes et génération des bulletins.',
    permissions: [
      { id: 'p5', code: 'grades:read', name: 'Consulter notes et moyennes' },
      { id: 'p6', code: 'grades:create', name: 'Saisir des notes d’examen' },
      { id: 'p7', code: 'grades:publish', name: 'Publier les bulletins officiels' },
    ],
    rolesCount: 3,
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'fn-finance-caisse',
    name: 'Encaissement & clôture de caisse TND',
    code: 'fn_finance_caisse',
    moduleId: 'mod-finance',
    moduleName: 'Finance & Trésorerie',
    description: 'Enregistrement des règlements scolaires, gestion des sessions de caisse physique et génération des reçus.',
    permissions: [
      { id: 'p8', code: 'finance:read', name: 'Consulter état des paiements' },
      { id: 'p9', code: 'finance:charge', name: 'Encaisser frais et émettre reçus' },
      { id: 'p10', code: 'finance:caisse_open', name: 'Ouvrir / Clôturer la caisse TND' },
    ],
    rolesCount: 2,
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'fn-attendance-life',
    name: 'Pointage des absences & vie scolaire',
    code: 'fn_attendance_life',
    moduleId: 'mod-life',
    moduleName: 'Vie Scolaire & Présence',
    description: 'Suivi journalier des présences, justification des retards, et alertes automatiques vers les parents.',
    permissions: [
      { id: 'p11', code: 'attendance:log', name: 'Pointer les présences & absences' },
      { id: 'p12', code: 'schedule:manage', name: 'Gérer les emplois du temps' },
    ],
    rolesCount: 3,
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'fn-livekit-classes',
    name: 'Classes virtuelles & visio LiveKit HD',
    code: 'fn_livekit_classes',
    moduleId: 'mod-webrtc',
    moduleName: 'Classes Virtuelles & Réunions',
    description: 'Salles de réunions interactives avec partage d’écran, vote électronique sur les points à l’ordre du jour et enregistrement.',
    permissions: [
      { id: 'p13', code: 'portal:access', name: 'Accéder aux espaces dédiés' },
    ],
    rolesCount: 2,
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    isDeleted: false,
  },
];

@Injectable()
export class SaaSFunctionsService {
  private filePath: string;
  private functions: SaaSFunctionRecord[] = [];

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch { /* ignored */ }
    }
    this.filePath = path.join(dataDir, 'saas-functions.json');
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.functions = JSON.parse(raw);
      } else {
        this.functions = [...DEFAULT_FUNCTIONS];
        this.saveData();
      }
    } catch {
      this.functions = [...DEFAULT_FUNCTIONS];
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.functions, null, 2), 'utf-8');
    } catch { /* ignored */ }
  }

  async findAll(query: QuerySaaSFunctionDto): Promise<{ data: SaaSFunctionRecord[]; total: number }> {
    const { includeDeleted, search, moduleId, isActive } = query;
    let list = this.functions;

    if (!includeDeleted) {
      list = list.filter((f) => !f.isDeleted);
    }

    if (isActive !== undefined) {
      list = list.filter((f) => f.isActive === isActive);
    }

    if (moduleId) {
      list = list.filter((f) => f.moduleId === moduleId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.moduleName.toLowerCase().includes(q),
      );
    }

    return {
      data: list,
      total: list.length,
    };
  }

  async findOne(id: string): Promise<SaaSFunctionRecord> {
    const fn = this.functions.find((f) => f.id === id);
    if (!fn) {
      throw new NotFoundException(`Fonctionnalité avec l'ID ${id} non trouvée`);
    }
    return fn;
  }

  async create(dto: CreateSaaSFunctionDto): Promise<SaaSFunctionRecord> {
    const existing = this.functions.find((f) => f.code === dto.code && !f.isDeleted);
    if (existing) {
      throw new ConflictException(`Une fonctionnalité avec le code "${dto.code}" existe déjà`);
    }

    const now = new Date().toISOString();
    const newRecord: SaaSFunctionRecord = {
      id: randomUUID(),
      name: dto.name,
      code: dto.code,
      moduleId: dto.moduleId || 'mod-academic',
      moduleName: dto.moduleName || 'Général',
      description: dto.description || '',
      permissions: dto.permissions || [],
      rolesCount: dto.rolesCount || 0,
      isActive: dto.isActive !== false,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    this.functions.push(newRecord);
    this.saveData();
    return newRecord;
  }

  async update(id: string, dto: UpdateSaaSFunctionDto): Promise<SaaSFunctionRecord> {
    const index = this.functions.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new NotFoundException(`Fonctionnalité avec l'ID ${id} non trouvée`);
    }

    if (dto.code && dto.code !== this.functions[index].code) {
      const conflict = this.functions.find((f) => f.code === dto.code && f.id !== id && !f.isDeleted);
      if (conflict) {
        throw new ConflictException(`Une fonctionnalité avec le code "${dto.code}" existe déjà`);
      }
    }

    const existing = this.functions[index];
    const updated: SaaSFunctionRecord = {
      ...existing,
      name: dto.name !== undefined ? dto.name : existing.name,
      code: dto.code !== undefined ? dto.code : existing.code,
      moduleId: dto.moduleId !== undefined ? dto.moduleId : existing.moduleId,
      moduleName: dto.moduleName !== undefined ? dto.moduleName : existing.moduleName,
      description: dto.description !== undefined ? dto.description : existing.description,
      permissions: dto.permissions !== undefined ? dto.permissions : existing.permissions,
      rolesCount: dto.rolesCount !== undefined ? dto.rolesCount : existing.rolesCount,
      isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    this.functions[index] = updated;
    this.saveData();
    return updated;
  }

  async remove(id: string, permanent = false): Promise<{ success: boolean; message: string }> {
    const index = this.functions.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new NotFoundException(`Fonctionnalité avec l'ID ${id} non trouvée`);
    }

    if (permanent) {
      this.functions.splice(index, 1);
      this.saveData();
      return { success: true, message: 'Fonctionnalité définitivement supprimée' };
    }

    this.functions[index] = {
      ...this.functions[index],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return { success: true, message: 'Fonctionnalité archivée' };
  }

  async restore(id: string): Promise<SaaSFunctionRecord> {
    const index = this.functions.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new NotFoundException(`Fonctionnalité avec l'ID ${id} non trouvée`);
    }

    this.functions[index] = {
      ...this.functions[index],
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.functions[index];
  }
}
