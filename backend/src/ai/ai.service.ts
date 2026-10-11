import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import {
  AiChatDto,
  AiGenerateExamDto,
  AiGenerateBulletinRemarksDto,
  AiGenerateHomeworkDto,
  AiPlatformConfigDto,
} from './ai.dto';

export interface AiCallResult {
  content: string;
  provider: string;
  model: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  /**
   * Verify whether the tenant has AI features active.
   * If user is ROOT, access is always granted.
   */
  async isTenantAiEnabled(tenantId: string | null, isRoot?: boolean): Promise<boolean> {
    if (isRoot) {
      return true;
    }
    if (!tenantId) {
      return false;
    }

    // 1. Check explicit override on the tenant
    const override = await this.prisma.tenantPlanFeatureOverride.findUnique({
      where: {
        tenantId_featureCode: {
          tenantId,
          featureCode: 'AI_FEATURES_ENABLED',
        },
      },
    });

    if (override) {
      return override.value === 'true' || override.value === '1';
    }

    // 2. Check tenant active subscription plan feature
    const activeSub = await this.prisma.tenantSubscription.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        isDeleted: false,
      },
      include: {
        plan: {
          include: {
            features: true,
          },
        },
      },
    });

    const planFeature = activeSub?.plan?.features?.find(
      (f) => f.code === 'AI_FEATURES_ENABLED',
    );

    return planFeature ? planFeature.value === 'true' || planFeature.value === '1' : false;
  }

  /**
   * Return the AI feature status for the calling user's tenant
   */
  async getStatusForUser(user: any): Promise<{
    isEnabled: boolean;
    provider: string;
    model: string;
  }> {
    const isEnabled = await this.isTenantAiEnabled(user.tenantId, user.isRoot);
    const config = await this.getResolvedConfig();

    return {
      isEnabled,
      provider: config.provider,
      model: config.model,
    };
  }

  /**
   * Load decrypted API keys and provider configuration from PlatformSettings or process.env
   */
  async getResolvedConfig(): Promise<{
    provider: 'GEMINI' | 'GROQ' | 'OPENROUTER';
    model: string;
    geminiApiKey: string | null;
    groqApiKey: string | null;
    openrouterApiKey: string | null;
  }> {
    const settings = await this.platformSettingsService.getAllAsMap(true);

    const provider: 'GEMINI' | 'GROQ' | 'OPENROUTER' =
      settings['AI_DEFAULT_PROVIDER'] || 'GEMINI';

    const decryptVal = (keyName: string, envVal?: string): string | null => {
      const stored = settings[keyName];
      if (stored && typeof stored === 'string') {
        const decrypted = this.cryptoService.decrypt(stored);
        return decrypted || stored;
      }
      return envVal || null;
    };

    const geminiApiKey = decryptVal(
      'AI_GEMINI_API_KEY',
      process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
    );
    const groqApiKey = decryptVal('AI_GROQ_API_KEY', process.env.GROQ_API_KEY);
    const openrouterApiKey = decryptVal(
      'AI_OPENROUTER_API_KEY',
      process.env.OPENROUTER_API_KEY,
    );

    let model = settings['AI_DEFAULT_MODEL'];
    if (!model) {
      if (provider === 'GEMINI') model = 'gemini-2.5-flash';
      else if (provider === 'GROQ') model = 'llama-3.3-70b-versatile';
      else model = 'meta-llama/llama-3.3-70b-instruct';
    }

    return {
      provider,
      model,
      geminiApiKey,
      groqApiKey,
      openrouterApiKey,
    };
  }

  /**
   * Low-level dispatcher to Google Gemini, Groq, or OpenRouter with fallback
   */
  async callAi(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      preferredProvider?: 'GEMINI' | 'GROQ' | 'OPENROUTER';
      preferredModel?: string;
    },
  ): Promise<AiCallResult> {
    const config = await this.getResolvedConfig();
    const primaryProvider = options?.preferredProvider || config.provider;

    const providersToTry: Array<'GEMINI' | 'GROQ' | 'OPENROUTER'> = [
      primaryProvider,
      ...(['GEMINI', 'GROQ', 'OPENROUTER'] as const).filter((p) => p !== primaryProvider),
    ];

    let lastError: any = null;

    for (const provider of providersToTry) {
      try {
        if (provider === 'GEMINI' && config.geminiApiKey) {
          const model =
            provider === primaryProvider && options?.preferredModel
              ? options.preferredModel
              : 'gemini-2.5-flash';
          const content = await this.callGemini(
            config.geminiApiKey,
            model,
            messages,
            options?.temperature,
          );
          return { content, provider: 'GEMINI', model };
        }

        if (provider === 'GROQ' && config.groqApiKey) {
          const model =
            provider === primaryProvider && options?.preferredModel
              ? options.preferredModel
              : 'llama-3.3-70b-versatile';
          const content = await this.callGroq(
            config.groqApiKey,
            model,
            messages,
            options?.temperature,
          );
          return { content, provider: 'GROQ', model };
        }

        if (provider === 'OPENROUTER' && config.openrouterApiKey) {
          const model =
            provider === primaryProvider && options?.preferredModel
              ? options.preferredModel
              : 'meta-llama/llama-3.3-70b-instruct';
          const content = await this.callOpenRouter(
            config.openrouterApiKey,
            model,
            messages,
            options?.temperature,
          );
          return { content, provider: 'OPENROUTER', model };
        }
      } catch (err: any) {
        this.logger.warn(`AI Provider ${provider} failed: ${err.message}`);
        lastError = err;
      }
    }

    if (lastError) {
      throw new BadRequestException(
        `Échec de l'appel aux fournisseurs d'IA configurés: ${lastError.message}`,
      );
    }

    throw new BadRequestException(
      "Aucune clé d'API valide configurée pour Google AI Studio (Gemini), Groq ou OpenRouter.",
    );
  }

  private async callGemini(
    apiKey: string,
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature = 0.7,
  ): Promise<string> {
    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const conversation = messages.filter((m) => m.role !== 'system');

    const contents = conversation.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If conversation is empty, add a prompt
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Bonjour' }] });
    }

    const payload: any = {
      contents,
      generationConfig: {
        temperature,
      },
    };

    if (systemMessage) {
      payload.systemInstruction = {
        parts: [{ text: systemMessage }],
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errText}`);
    }

    const data: any = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Réponse vide reçue de Google Gemini');
    }

    return candidate;
  }

  private async callGroq(
    apiKey: string,
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature = 0.7,
  ): Promise<string> {
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error [${response.status}]: ${errText}`);
    }

    const data: any = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Réponse vide reçue de Groq');
    }

    return reply;
  }

  private async callOpenRouter(
    apiKey: string,
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature = 0.7,
  ): Promise<string> {
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://bsofts-school.com',
        'X-Title': 'BSofts School AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error [${response.status}]: ${errText}`);
    }

    const data: any = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Réponse vide reçue de OpenRouter');
    }

    return reply;
  }

  /**
   * Conversational Assistant strictly isolated to the caller's tenant
   */
  async chat(user: any, dto: AiChatDto) {
    const isAllowed = await this.isTenantAiEnabled(user.tenantId, user.isRoot);
    if (!isAllowed) {
      throw new ForbiddenException(
        "Les fonctionnalités IA ne sont pas activées pour votre compte d'établissement.",
      );
    }

    // Assemble Tenant-Scoped Context
    let tenantContextSummary = 'Utilisateur Système Global (Root)';
    if (user.tenantId) {
      const [establishments, classesCount, studentsCount, teachersCount] = await Promise.all([
        this.prisma.establishment.findMany({
          where: { tenantId: user.tenantId, isDeleted: false },
          select: { id: true, name: true, category: true, city: true },
        }),
        this.prisma.class.count({
          where: { establishment: { tenantId: user.tenantId }, isDeleted: false },
        }),
        this.prisma.student.count({
          where: { establishment: { tenantId: user.tenantId }, isDeleted: false },
        }),
        this.prisma.teacher.count({
          where: { establishment: { tenantId: user.tenantId }, isDeleted: false },
        }),
      ]);

      const estabList = establishments
        .map((e) => `- ${e.name} (${e.category}, ${e.city || 'N/A'}) [ID: ${e.id}]`)
        .join('\n');

      tenantContextSummary = `
DONNÉES DE L'ÉTABLISSEMENT / TENANT :
- Nombre d'établissements rattachés : ${establishments.length}
${estabList}
- Total Élèves : ${studentsCount}
- Total Enseignants : ${teachersCount}
- Total Classes : ${classesCount}
`;
    }

    const systemPrompt = `Vous êtes l'assistant intelligent et pédagogique de BSofts School (plateforme de gestion scolaire tout-en-un).
RÈGLES STRICTES DE CONFIDENTIALITÉ ET D'ISOLATION MULTI-TENANT :
1. Vous devez UNIQUEMENT répondre en utilisant les informations relatives au locataire (tenant) authentifié. Ne révélez JAMAIS aucune information appartenant à un autre locataire.
2. Si l'utilisateur vous pose une question en Français, répondez en Français. S'il écrit en Arabe, répondez en Arabe. S'il écrit en Anglais, répondez en Anglais.
3. Soyez courtois, professionnel, synthétique et pédagogique. Utilisez des listes à puces pour structurer vos réponses.
4. N'inventez jamais de données statistiques non confirmées.

CONTEXTE ACTUEL DU TENANT :
${tenantContextSummary}
Utilisateur actuel : ${user.firstName || ''} ${user.lastName || ''} (${user.email || user.username || ''})
`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (dto.history && dto.history.length > 0) {
      for (const h of dto.history.slice(-8)) {
        messages.push({ role: h.role, content: h.content });
      }
    }

    messages.push({ role: 'user', content: dto.message });

    const result = await this.callAi(messages);

    return {
      reply: result.content,
      provider: result.provider,
      model: result.model,
    };
  }

  /**
   * Generate Exam questions strictly aligned with class & matiere
   */
  async generateExam(user: any, dto: AiGenerateExamDto) {
    const isAllowed = await this.isTenantAiEnabled(user.tenantId, user.isRoot);
    if (!isAllowed) {
      throw new ForbiddenException(
        "Les fonctionnalités IA ne sont pas activées pour votre établissement.",
      );
    }

    // Tenant check if specific IDs provided
    if (dto.classId && user.tenantId && !user.isRoot) {
      const classRecord = await this.prisma.class.findFirst({
        where: { id: dto.classId, establishment: { tenantId: user.tenantId } },
      });
      if (!classRecord) {
        throw new ForbiddenException("Classe introuvable ou n'appartenant pas à votre établissement.");
      }
    }

    const questionCount = dto.questionCount || 5;
    const difficulty = dto.difficulty || 'MEDIUM';
    const type = dto.type || 'MIXED';

    const systemPrompt = `Vous êtes un expert pédagogique et concepteur d'épreuves scolaires pour BSofts School.
Votre tâche est de générer un sujet d'examen complet, rigoureux et équilibré au format JSON strict.

Format JSON attendu :
{
  "title": "Titre officiel de l'épreuve",
  "subject": "${dto.matiereName || 'Matière'}",
  "classLevel": "${dto.className || 'Classe'}",
  "instructions": "Consignes générales pour l'élève",
  "durationMinutes": ${dto.duration || 60},
  "totalPoints": 20,
  "questions": [
    {
      "id": 1,
      "type": "QCM" ou "OPEN" ou "EXERCISE",
      "question": "Énoncé clair de la question",
      "options": ["Choix A", "Choix B", "Choix C", "Choix D"], // si QCM, sinon null
      "correctAnswer": "Réponse exacte ou corrigé type",
      "points": 4,
      "explanation": "Explication pédagogique"
    }
  ]
}
Répondez UNIQUEMENT avec le bloc JSON valide, sans texte additionnel ni markdown en dehors du JSON.`;

    const userPrompt = `Générer un sujet d'examen sur le thème : "${dto.topic}".
Matière : ${dto.matiereName || 'Générale'}
Niveau / Classe : ${dto.className || 'Secondaire'}
Nombre de questions : ${questionCount}
Niveau de difficulté : ${difficulty}
Type : ${type}`;

    const result = await this.callAi([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    let parsed: any;
    try {
      const cleanJson = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = { rawContent: result.content };
    }

    return {
      exam: parsed,
      provider: result.provider,
      model: result.model,
    };
  }

  /**
   * Generate personalized pedagogical remarks for report card (bulletin)
   */
  async generateBulletinRemarks(user: any, dto: AiGenerateBulletinRemarksDto) {
    const isAllowed = await this.isTenantAiEnabled(user.tenantId, user.isRoot);
    if (!isAllowed) {
      throw new ForbiddenException(
        "Les fonctionnalités IA ne sont pas activées pour votre établissement.",
      );
    }

    // Verify student belongs to caller's tenant
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: {
        establishment: true,
        classAssignments: {
          take: 1,
          include: {
            class: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Élève non trouvé');
    }

    if (user.tenantId && !user.isRoot && student.establishment.tenantId !== user.tenantId) {
      throw new ForbiddenException("Cet élève n'appartient pas à votre établissement.");
    }

    const lang = dto.language || 'FR';
    const average = dto.averageScore !== undefined ? `${dto.averageScore}/20` : 'Non renseignée';
    const resolvedClassName = student.classAssignments?.[0]?.class?.name || 'N/A';

    const systemPrompt = `Vous êtes le conseil des professeurs et le responsable pédagogique d'un établissement scolaire d'excellence.
Rédigez une appréciation générale pour le bulletin scolaire de l'élève.
L'appréciation doit être bienveillante, constructive, motivante et professionnelle (environ 3 à 5 phrases).
Langue de rédaction : ${lang === 'AR' ? 'Arabe' : lang === 'EN' ? 'Anglais' : 'Français'}.
Ne mentionnez aucun mot de remplissage, donnez directement le texte de l'appréciation.`;

    const userPrompt = `Élève : ${student.firstName} ${student.lastName}
Classe : ${resolvedClassName}
Moyenne générale : ${average}
Comportement : ${dto.conduct || 'Bonne attitude générale'}
Points forts : ${dto.strengths || 'Régularité'}
Axes de progrès : ${dto.areasForImprovement || 'Poursuivre les efforts'}`;

    const result = await this.callAi([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      remarks: result.content.trim(),
      provider: result.provider,
      model: result.model,
    };
  }

  /**
   * Generate homework assignments with structured exercises & instructions
   */
  async generateHomework(user: any, dto: AiGenerateHomeworkDto) {
    const isAllowed = await this.isTenantAiEnabled(user.tenantId, user.isRoot);
    if (!isAllowed) {
      throw new ForbiddenException(
        "Les fonctionnalités IA ne sont pas activées pour votre établissement.",
      );
    }

    const systemPrompt = `Vous êtes un enseignant expérimenté concevant un devoir à la maison (Homework) sur BSofts School.
Générez un devoir clair, engageant et pédagogique au format JSON strict.

Format JSON attendu :
{
  "title": "Titre du devoir",
  "instructions": "Instructions et méthode pour réussir le devoir",
  "exercises": [
    {
      "number": 1,
      "title": "Titre de l'exercice",
      "content": "Consigne détaillée et énoncé",
      "expectedDeliverable": "Ce que l'élève doit rendre",
      "estimatedDurationMinutes": 30
    }
  ],
  "rubricCriteria": [
    "Critère 1 : Clarté du raisonnement (5 pts)",
    "Critère 2 : Justesse des calculs (10 pts)",
    "Critère 3 : Soin et présentation (5 pts)"
  ]
}
Répondez UNIQUEMENT avec le bloc JSON valide.`;

    const userPrompt = `Sujet / Objectif d'apprentissage : "${dto.topic}".
Matière : ${dto.matiereName || 'Générale'}
Classe : ${dto.className || 'Secondaire'}
Consignes souhaitées : ${dto.instructions || 'Exercices d’application et approfondissement'}`;

    const result = await this.callAi([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    let parsed: any;
    try {
      const cleanJson = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = { rawContent: result.content };
    }

    return {
      homework: parsed,
      provider: result.provider,
      model: result.model,
    };
  }

  /**
   * ROOT / Developer action: Toggle AI feature access for a specific tenant
   */
  async toggleTenantAi(tenantId: string, isEnabled: boolean, actor?: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant avec l'ID '${tenantId}' introuvable.`);
    }

    const record = await this.prisma.tenantPlanFeatureOverride.upsert({
      where: {
        tenantId_featureCode: {
          tenantId,
          featureCode: 'AI_FEATURES_ENABLED',
        },
      },
      update: {
        value: isEnabled ? 'true' : 'false',
      },
      create: {
        tenantId,
        featureCode: 'AI_FEATURES_ENABLED',
        value: isEnabled ? 'true' : 'false',
      },
    });

    const actorSnapshot = actor
      ? `${actor.firstName || ''} ${actor.lastName || ''} (@${actor.username || actor.email || ''}) [${actor.role || 'ROOT'}]`.trim()
      : 'Developer/Root';

    await this.prisma.auditLog.create({
      data: {
        userId: actor?.id,
        actorSnapshot,
        action: isEnabled ? 'ENABLE_TENANT_AI' : 'DISABLE_TENANT_AI',
        entity: 'TenantPlanFeatureOverride',
        entityId: record.id,
        status: 'SUCCESS',
        newValues: { tenantId, featureCode: 'AI_FEATURES_ENABLED', isEnabled },
      },
    });

    return {
      tenantId,
      isEnabled,
      message: `Fonctionnalité IA ${isEnabled ? 'activée' : 'désactivée'} pour le tenant ${tenant.user?.email || tenantId}.`,
    };
  }

  /**
   * ROOT / Developer action: Get platform AI configuration with masked keys
   */
  async getAdminPlatformConfig() {
    const config = await this.getResolvedConfig();

    const maskKey = (key: string | null) => {
      if (!key) return null;
      if (key.length <= 8) return '••••••••';
      return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
    };

    return {
      provider: config.provider,
      model: config.model,
      geminiConfigured: Boolean(config.geminiApiKey),
      geminiApiKeyMasked: maskKey(config.geminiApiKey),
      groqConfigured: Boolean(config.groqApiKey),
      groqApiKeyMasked: maskKey(config.groqApiKey),
      openrouterConfigured: Boolean(config.openrouterApiKey),
      openrouterApiKeyMasked: maskKey(config.openrouterApiKey),
    };
  }

  /**
   * ROOT / Developer action: Update platform AI configuration & encrypt API keys
   */
  async updateAdminPlatformConfig(dto: AiPlatformConfigDto, actor?: any) {
    if (dto.provider) {
      await this.platformSettingsService.upsert(
        {
          key: 'AI_DEFAULT_PROVIDER',
          value: dto.provider,
          category: 'AI_INTEGRATION',
          description: 'Fournisseur d’IA par défaut (GEMINI, GROQ, OPENROUTER)',
          isPublic: false,
        },
        actor,
      );
    }

    if (dto.model) {
      await this.platformSettingsService.upsert(
        {
          key: 'AI_DEFAULT_MODEL',
          value: dto.model,
          category: 'AI_INTEGRATION',
          description: 'Modèle IA par défaut',
          isPublic: false,
        },
        actor,
      );
    }

    if (dto.geminiApiKey) {
      const encrypted = this.cryptoService.encrypt(dto.geminiApiKey);
      await this.platformSettingsService.upsert(
        {
          key: 'AI_GEMINI_API_KEY',
          value: encrypted || dto.geminiApiKey,
          category: 'AI_INTEGRATION',
          description: 'Clé API Google AI Studio / Gemini chiffrée',
          isPublic: false,
        },
        actor,
      );
    }

    if (dto.groqApiKey) {
      const encrypted = this.cryptoService.encrypt(dto.groqApiKey);
      await this.platformSettingsService.upsert(
        {
          key: 'AI_GROQ_API_KEY',
          value: encrypted || dto.groqApiKey,
          category: 'AI_INTEGRATION',
          description: 'Clé API Groq chiffrée',
          isPublic: false,
        },
        actor,
      );
    }

    if (dto.openrouterApiKey) {
      const encrypted = this.cryptoService.encrypt(dto.openrouterApiKey);
      await this.platformSettingsService.upsert(
        {
          key: 'AI_OPENROUTER_API_KEY',
          value: encrypted || dto.openrouterApiKey,
          category: 'AI_INTEGRATION',
          description: 'Clé API OpenRouter chiffrée',
          isPublic: false,
        },
        actor,
      );
    }

    return this.getAdminPlatformConfig();
  }
}
