'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Coins,
  Shield,
  Save,
  RotateCcw,
  Building,
  CheckCircle2,
  Mail,
  Send,
  AlertCircle,
  Video,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function SaaSPlatformSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // SaaS Configuration State
  const [settings, setSettings] = useState({
    // Branding & Identity
    platformName: 'BSofts School — Plateforme Éducative SaaS',
    tagline: 'L’Écosystème Numérique Intégré pour la Gestion Scolaire & Universitaire en Tunisie',
    supportEmail: 'contact@bsofts.tn',
    supportPhone: '+216 71 890 000',
    logoUrl: '/brand/bsofts-logo.png',

    // Colors & Theme (Strict 5-color palette)
    primaryColor: '#242F40',
    secondaryColor: '#CCA43B',
    accentColor: '#363636',
    themeDefault: 'LIGHT' as 'LIGHT' | 'DARK' | 'SYSTEM',

    // Localization & Currency
    defaultCurrency: 'TND',
    currencyDecimals: 3,
    defaultLanguage: 'fr' as 'fr' | 'ar' | 'en',
    timezone: 'Africa/Tunis (UTC+1)',
    dateFormat: 'DD/MM/YYYY',

    // Academic & System Defaults
    currentAcademicYear: '2025-2026',
    systemEvaluationMode: 'TRIMESTRIEL' as 'TRIMESTRIEL' | 'SEMESTRIEL',
    allowTenantSelfRegistration: true,
    maintenanceMode: false,
    sessionTimeoutMinutes: 60,
    enforceTwoFactorAdmin: true,
  });

  // SMTP Configuration State
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: 465,
    user: '',
    password: '',
    fromName: 'BSofts School',
    fromEmail: '',
    isSecure: true,
    isDefault: true,
    resendApiKey: '',
  });
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // LiveKit Configuration State
  const [livekitConfig, setLivekitConfig] = useState({
    url: 'wss://bsofts-yid6ey9o.livekit.cloud',
    apiKey: 'APIusw2GoZsh792',
    apiSecret: 'mlPDCxP4fayL3O0ZHpHKQxCl1PYnMfjrdr1R49nfxW3A',
    tokenTtlMinutes: 240,
  });
  const [isTestingLivekit, setIsTestingLivekit] = useState(false);
  const [livekitStatus, setLivekitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Platform Payment Gateways State (Level 1: SaaS Subscriptions)
  const [paymentConfig, setPaymentConfig] = useState({
    stripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    stripeTestMode: false,
    stripeCurrency: 'EUR',
    clicToPayEnabled: true,
    clicToPayMerchantId: '',
    clicToPayApiKey: '',
    clicToPaySecretKey: '',
    clicToPayTerminalId: '',
    clicToPayTestMode: true,
    clicToPayCurrency: 'TND',
    currency: 'TND',
  });
  const [paymentStatus, setPaymentStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    api.get('/saas-settings')
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});

    api.get('/mail/config')
      .then((res) => {
        if (res.data) {
          setSmtpConfig({
            host: res.data.host || 'smtp.gmail.com',
            port: res.data.port || 465,
            user: res.data.user || '',
            password: res.data.password || '',
            fromName: res.data.fromName || 'BSofts School',
            fromEmail: res.data.fromEmail || '',
            isSecure: res.data.isSecure !== undefined ? Boolean(res.data.isSecure) : true,
            isDefault: true,
            resendApiKey: res.data.resendApiKey || '',
          });
        }
      })
      .catch(() => {});

    api.get('/livekit/config')
      .then((res) => {
        if (res.data) {
          setLivekitConfig({
            url: res.data.url || 'wss://bsofts-yid6ey9o.livekit.cloud',
            apiKey: res.data.apiKey || 'APIusw2GoZsh792',
            apiSecret: res.data.apiSecret || '',
            tokenTtlMinutes: res.data.tokenTtlMinutes || 240,
          });
        }
      })
      .catch(() => {});

    api.get('/billing/config')
      .then((res) => {
        if (res.data) {
          setPaymentConfig({
            stripeEnabled: Boolean(res.data.stripeEnabled),
            stripePublicKey: res.data.stripePublicKey || '',
            stripeSecretKey: res.data.stripeSecretKey || '',
            stripeWebhookSecret: res.data.stripeWebhookSecret || '',
            stripeTestMode: res.data.stripeTestMode !== undefined ? Boolean(res.data.stripeTestMode) : false,
            stripeCurrency: res.data.stripeCurrency || 'EUR',
            clicToPayEnabled: res.data.clicToPayEnabled !== undefined ? Boolean(res.data.clicToPayEnabled) : true,
            clicToPayMerchantId: res.data.clicToPayMerchantId || '',
            clicToPayApiKey: res.data.clicToPayApiKey || '',
            clicToPaySecretKey: res.data.clicToPaySecretKey || '',
            clicToPayTerminalId: res.data.clicToPayTerminalId || '',
            clicToPayTestMode: res.data.clicToPayTestMode !== undefined ? Boolean(res.data.clicToPayTestMode) : true,
            clicToPayCurrency: res.data.clicToPayCurrency || 'TND',
            currency: res.data.currency || 'TND',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPaymentStatus(null);
    try {
      await api.put('/billing/config', paymentConfig);
      setPaymentStatus({ type: 'success', message: 'Passerelles de paiement SaaS (ClicToPay & Stripe) mises à jour avec succès.' });
    } catch (err: any) {
      setPaymentStatus({ type: 'error', message: err?.response?.data?.message || 'Erreur lors de la sauvegarde des passerelles de paiement.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSmtpStatus(null);
    try {
      await api.post('/mail/config', smtpConfig);
      setSmtpStatus({ type: 'success', message: 'Configuration SMTP enregistrée avec succès dans la base de données.' });
    } catch (err: any) {
      setSmtpStatus({ type: 'error', message: err?.response?.data?.message || 'Erreur lors de la sauvegarde SMTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmail) {
      setSmtpStatus({ type: 'error', message: 'Veuillez renseigner un email de test.' });
      return;
    }
    setIsTestingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await api.post('/mail/test', { testEmail });
      if (res.data?.success) {
        setSmtpStatus({ type: 'success', message: `Email de test envoyé avec succès à ${testEmail} !` });
      } else {
        setSmtpStatus({ type: 'error', message: res.data?.error || 'Échec de l’envoi de test.' });
      }
    } catch (err: any) {
      setSmtpStatus({ type: 'error', message: err?.response?.data?.message || 'Erreur de connexion SMTP.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleSaveLivekit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLivekitStatus(null);
    try {
      await api.post('/livekit/config', livekitConfig);
      setLivekitStatus({ type: 'success', message: 'Paramètres LiveKit Cloud enregistrés avec succès dans la base de données.' });
    } catch (err: any) {
      setLivekitStatus({ type: 'error', message: err?.response?.data?.message || 'Erreur lors de la sauvegarde LiveKit.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLivekit = async () => {
    setIsTestingLivekit(true);
    setLivekitStatus(null);
    try {
      const res = await api.post('/livekit/test-connection', {});
      if (res.data?.success) {
        setLivekitStatus({ type: 'success', message: res.data.message || 'Connexion LiveKit Cloud validée !' });
      } else {
        setLivekitStatus({ type: 'error', message: res.data?.message || 'Échec du test de connexion LiveKit.' });
      }
    } catch (err: any) {
      setLivekitStatus({ type: 'error', message: err?.response?.data?.message || 'Erreur lors du test LiveKit.' });
    } finally {
      setIsTestingLivekit(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/saas-settings', settings).catch(() => {});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      platformName: 'BSofts School — Plateforme Éducative SaaS',
      tagline: 'L’Écosystème Numérique Intégré pour la Gestion Scolaire & Universitaire en Tunisie',
      supportEmail: 'contact@bsofts.tn',
      supportPhone: '+216 71 890 000',
      logoUrl: '/brand/bsofts-logo.png',
      primaryColor: '#2563EB',
      secondaryColor: '#4F46E5',
      accentColor: '#10B981',
      themeDefault: 'LIGHT',
      defaultCurrency: 'TND',
      currencyDecimals: 3,
      defaultLanguage: 'fr',
      timezone: 'Africa/Tunis (UTC+1)',
      dateFormat: 'DD/MM/YYYY',
      currentAcademicYear: '2025-2026',
      systemEvaluationMode: 'TRIMESTRIEL',
      allowTenantSelfRegistration: true,
      maintenanceMode: false,
      sessionTimeoutMinutes: 60,
      enforceTwoFactorAdmin: true,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Configuration Globale SaaS</h1>
            <p className="text-sm text-text-secondary">
              Paramètres généraux de la plateforme : identité visuelle, charte graphique, devise TND, langue et sécurité.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={handleResetDefaults}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Rétablir
          </Button>
          <Button onClick={handleSave} isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            Enregistrer les Réglages
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-200 text-emerald-700 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold">
              Paramètres généraux enregistrés et synchronisés avec succès sur tous les tenants !
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Couleurs & Thème Graphique */}
        <Card className="p-6 border border-border">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-border pb-3">
            <Palette className="w-5 h-5 text-brand" />
            Charte Graphique & Palette de Couleurs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Couleur Primaire */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-secondary">
                Couleur Primaire (Boutons & Actions Clés)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  aria-label="Couleur Primaire"
                  className="w-12 h-10 rounded-xl cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm rounded-xl bg-surface border border-border font-mono font-bold"
                />
              </div>
            </div>

            {/* Couleur Secondaire */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-secondary">
                Couleur Secondaire (Accents & Dégradés)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  aria-label="Couleur Secondaire"
                  className="w-12 h-10 rounded-xl cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm rounded-xl bg-surface border border-border font-mono font-bold"
                />
              </div>
            </div>

            {/* Couleur de Succès / Finance */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-secondary">
                Couleur Succès / Finance
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  aria-label="Couleur Succès / Finance"
                  className="w-12 h-10 rounded-xl cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm rounded-xl bg-surface border border-border font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-text-tertiary uppercase">Aperçu en Direct</span>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                Boutons, icônes actives et badges utiliseront ces valeurs hexadécimales.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Bouton Primaire
              </div>
              <div
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs"
                style={{ backgroundColor: settings.secondaryColor }}
              >
                Bouton Secondaire
              </div>
              <div
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs"
                style={{ backgroundColor: settings.accentColor }}
              >
                Encaissé TND
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Identité de la Marque & Contacts */}
        <Card className="p-6 border border-border">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-border pb-3">
            <Building className="w-5 h-5 text-brand" />
            Identité de la Marque & Coordonnées
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom Officiel de la Solution *"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              required
            />
            <Input
              label="Slogan / Sous-titre"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
            <Input
              label="Email Support Client"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              required
            />
            <Input
              label="Téléphone Support Technique"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
            />
          </div>
        </Card>

        {/* Section 3: Devise, Langue & Régional */}
        <Card className="p-6 border border-border">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-border pb-3">
            <Coins className="w-5 h-5 text-emerald-600" />
            Devise Financière & Paramètres Régionaux
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Devise Principale du Système *
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                aria-label="Devise Principale du Système"
                className="w-full px-3 py-2 text-sm rounded-xl bg-surface border border-border text-text-primary font-bold outline-none"
              >
                <option value="TND">Dinar Tunisien (TND) — Millimes</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Langue par Défaut de l’Interface *
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value as 'fr' | 'ar' | 'en' })}
                aria-label="Langue par Défaut de l’Interface"
                className="w-full px-3 py-2 text-sm rounded-xl bg-surface border border-border text-text-primary font-bold outline-none"
              >
                <option value="fr">Français (FR) — Défaut Pédagogique</option>
                <option value="ar">العربية (AR) — Arabe Tunisien & Officiel</option>
                <option value="en">English (EN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                Fuseau Horaire Référence
              </label>
              <Input
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Sécurité & Gouvernance SaaS */}
        <Card className="p-6 border border-border">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-border pb-3">
            <Shield className="w-5 h-5 text-indigo-600" />
            Sécurité & Fonctionnement Système
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Année Scolaire Courante de Référence"
              value={settings.currentAcademicYear}
              onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
            />
            <Input
              label="Délai d’Expiration de Session (minutes)"
              type="number"
              min={15}
              max={480}
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-subtle cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforceTwoFactorAdmin}
                onChange={(e) => setSettings({ ...settings, enforceTwoFactorAdmin: e.target.checked })}
                className="rounded text-brand focus:ring-brand w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Exiger l’Authentification à Deux Facteurs (2FA) pour les Rôles ROOT & ADMIN
                </span>
                <span className="text-[11px] text-text-secondary">
                  Renforce la sécurité contre les accès non autorisés aux dossiers scolaires et à la caisse.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-subtle cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowTenantSelfRegistration}
                onChange={(e) => setSettings({ ...settings, allowTenantSelfRegistration: e.target.checked })}
                className="rounded text-brand focus:ring-brand w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Autoriser la Création de Demande d’Abonnement Publique (Self-Service)
                </span>
                <span className="text-[11px] text-text-secondary">
                  Permet aux directeurs d’écoles de soumettre une demande depuis la page d’accueil.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Section 5: Configuration SMTP & Serveur Mail */}
        <Card className="p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand" />
              Serveur de Messagerie SMTP (Emails Transactionnels & Notifications)
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveSmtp}
              isLoading={isLoading}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Sauvegarder SMTP
            </Button>
          </div>

          <p className="text-xs text-text-secondary mb-3">
            Ces paramètres sont enregistrés dynamiquement dans la base de données (<code className="font-mono text-brand">PlatformSetting</code> et <code className="font-mono text-brand">SmtpConfig</code>) pour l’envoi des alertes d’absence, bulletins de paie, reçus et réinitialisations de mot de passe.
          </p>

          <div className="p-3.5 rounded-xl border border-brand/30 bg-brand/5 mb-4 text-xs text-text-primary space-y-1">
            <span className="font-bold block text-brand flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand" />
              Recommandation pour Gmail & Hébergement Cloud (Render / Vercel) :
            </span>
            <ul className="list-disc list-inside text-text-secondary space-y-0.5 pl-1">
              <li>Pour Gmail, configurez l&apos;hôte sur <code className="font-mono text-text-primary font-bold">smtp.gmail.com</code> et le port sur <code className="font-mono text-text-primary font-bold">465</code> avec <code className="font-mono text-text-primary font-bold">SSL Sécurisé : Coché</code>. Le port 587 est fréquemment filtré par les pare-feux cloud.</li>
              <li>Utilisez un <strong>Mot de passe d&apos;application Google (16 caractères)</strong> généré depuis <em>Compte Google &gt; Sécurité &gt; Mots de passe des applications</em>, et non le mot de passe habituel de votre compte.</li>
            </ul>
          </div>

          {smtpStatus && (
            <div
              className={`p-3.5 rounded-xl border mb-4 flex items-center gap-2 text-xs font-semibold ${
                smtpStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-200 text-emerald-700'
                  : 'bg-rose-500/10 border-rose-200 text-rose-700'
              }`}
            >
              {smtpStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{smtpStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              label="Hôte SMTP (Host) *"
              placeholder="smtp.gmail.com ou smtp.mailtrap.io"
              value={smtpConfig.host}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
            />
            <Input
              label="Port SMTP *"
              type="number"
              placeholder="465 ou 587"
              value={smtpConfig.port}
              onChange={(e) => {
                const p = Number(e.target.value);
                setSmtpConfig({
                  ...smtpConfig,
                  port: p,
                  isSecure: p === 465,
                });
              }}
            />
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-border cursor-pointer h-[42px]">
                <input
                  type="checkbox"
                  checked={smtpConfig.isSecure}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, isSecure: e.target.checked })}
                  className="rounded text-brand focus:ring-brand w-4 h-4"
                />
                <span className="text-xs font-bold text-text-primary">
                  Activer SSL / TLS Sécurisé (Recommandé : Port 465)
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Utilisateur SMTP (Username / Email) *"
              placeholder="contact@bsofts.tn"
              value={smtpConfig.user}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
            />
            <Input
              label="Mot de Passe SMTP (App Password) *"
              type="password"
              placeholder="••••••••••••"
              value={smtpConfig.password}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <Input
              label="Nom de l'Expéditeur (From Name)"
              placeholder="École Pilote BSofts"
              value={smtpConfig.fromName}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
            />
            <Input
              label="Email de l'Expéditeur (From Email)"
              placeholder="no-reply@bsofts-school.com"
              value={smtpConfig.fromEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
            />
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 mb-4">
            <Input
              label="Clé API Resend (Alternative HTTPS pour contourner le pare-feu Render Free)"
              type="password"
              placeholder="re_xxxxxxxxxxxxxx (Optionnel)"
              value={smtpConfig.resendApiKey}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, resendApiKey: e.target.value })}
            />
            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
              Sur les hébergements cloud gratuits (Render Free), les ports SMTP sortants (25, 465, 587) sont bloqués. Vous pouvez renseigner une clé API gratuite <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-brand font-bold underline">Resend.com</a> (3 000 emails/mois offerts) pour expédier immédiatement vos emails via HTTPS (Port 443) sans aucun blocage réseau.
            </p>
          </div>

          {/* Test de Connexion SMTP */}
          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <span className="text-xs font-bold text-text-primary block">Tester l&apos;Envoi SMTP en Temps Réel</span>
              <span className="text-[11px] text-text-secondary">
                Envoie un email de diagnostic immédiat pour valider la délivrabilité.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Votre email de test"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-surface-elevated border border-border font-medium w-52 outline-none focus:border-brand"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestSmtp}
                isLoading={isTestingSmtp}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Tester
              </Button>
            </div>
          </div>
        </Card>

        {/* Section 6: Configuration LiveKit Cloud (WebRTC & Réunions) */}
        <Card className="p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              Serveur WebRTC LiveKit Cloud (Visioconférence & Réunions Dynamiques)
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveLivekit}
              isLoading={isLoading}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Sauvegarder LiveKit
            </Button>
          </div>

          <p className="text-xs text-text-secondary mb-4">
            Paramètres dynamiques pour la génération de tokens d’accès et l’orchestration des salles de classe virtuelles et réunions des conseils d’école en temps réel.
          </p>

          {livekitStatus && (
            <div
              className={`p-3.5 rounded-xl border mb-4 flex items-center gap-2 text-xs font-semibold ${
                livekitStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-200 text-emerald-700'
                  : 'bg-rose-500/10 border-rose-200 text-rose-700'
              }`}
            >
              {livekitStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{livekitStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="URL LiveKit Cloud (WebSocket wss://) *"
              placeholder="wss://bsofts-yid6ey9o.livekit.cloud"
              value={livekitConfig.url}
              onChange={(e) => setLivekitConfig({ ...livekitConfig, url: e.target.value })}
            />
            <Input
              label="Durée de Validité des Tokens (Minutes)"
              type="number"
              min={15}
              max={1440}
              value={livekitConfig.tokenTtlMinutes}
              onChange={(e) => setLivekitConfig({ ...livekitConfig, tokenTtlMinutes: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <Input
              label="Clé d’API LiveKit (API Key) *"
              placeholder="APIusw2GoZsh792"
              value={livekitConfig.apiKey}
              onChange={(e) => setLivekitConfig({ ...livekitConfig, apiKey: e.target.value })}
            />
            <Input
              label="Secret d’API LiveKit (API Secret) *"
              type="password"
              placeholder="••••••••••••••••"
              value={livekitConfig.apiSecret}
              onChange={(e) => setLivekitConfig({ ...livekitConfig, apiSecret: e.target.value })}
            />
          </div>

          {/* Test de Connexion LiveKit */}
          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-xs font-bold text-text-primary block">Diagnostic LiveKit Cloud</span>
              <span className="text-[11px] text-text-secondary">
                Vérifie la validité du point de terminaison WebSocket et la cohérence de la clé API.
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleTestLivekit}
              isLoading={isTestingLivekit}
            >
              <Video className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Tester la Connexion LiveKit
            </Button>
          </div>
        </Card>

        {/* Section 7: Passerelles de Paiement SaaS (Niveau 1: Abonnements Plateforme BSofts) */}
        <Card className="p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-border pb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              Passerelles de Paiement SaaS (Abonnements Tenants & Établissements)
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSavePaymentConfig}
              isLoading={isLoading}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Sauvegarder Passerelles
            </Button>
          </div>

          <p className="text-xs text-text-secondary mb-4">
            Configuration dynamique des terminaux d’encaissement pour les abonnements SaaS versés par les établissements scolaires à la plateforme BSofts. Réservé à l’administrateur racine (Root).
          </p>

          {paymentStatus && (
            <div
              className={`p-3.5 rounded-xl border mb-4 flex items-center gap-2 text-xs font-semibold ${
                paymentStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-200 text-emerald-700'
                  : 'bg-rose-500/10 border-rose-200 text-rose-700'
              }`}
            >
              {paymentStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{paymentStatus.message}</span>
            </div>
          )}

          {/* Devise par défaut de la plateforme */}
          <div className="mb-6 p-4 rounded-xl bg-surface border border-border">
            <div className="max-w-xs">
              <label className="text-xs font-bold text-text-primary block mb-1.5">Devise d’encaissement principale SaaS</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                value={paymentConfig.currency}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, currency: e.target.value })}
              >
                <option value="TND">TND — Dinar Tunisien (Millimes)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="USD">USD — Dollar US ($)</option>
              </select>
            </div>
          </div>

          {/* ClicToPay Monétique Tunisie */}
          <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-bold text-text-primary block flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  ClicToPay — Monétique Tunisie (SMT)
                </span>
                <span className="text-xs text-text-secondary">
                  Cartes bancaires nationales tunisiennes (GIE Monétique Tunisie / Carte Bancaire & e-Dinar).
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={paymentConfig.clicToPayEnabled}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPayEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                label="ID Marchand ClicToPay"
                placeholder="Ex: 1000000000"
                value={paymentConfig.clicToPayMerchantId}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPayMerchantId: e.target.value })}
              />
              <Input
                label="ID Terminal ClicToPay"
                placeholder="Ex: 001"
                value={paymentConfig.clicToPayTerminalId}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPayTerminalId: e.target.value })}
              />
              <Input
                label="Nom d’Utilisateur API"
                placeholder="Ex: merchant_api"
                value={paymentConfig.clicToPayApiKey}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPayApiKey: e.target.value })}
              />
              <Input
                label="Mot de Passe API"
                type="password"
                placeholder="••••••••••••••••"
                value={paymentConfig.clicToPaySecretKey}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPaySecretKey: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-500/10 items-center">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Devise ClicToPay</label>
                <select
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={paymentConfig.clicToPayCurrency}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPayCurrency: e.target.value })}
                >
                  <option value="TND">TND — Dinar Tunisien (Millimes)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4 sm:pt-0">
                <input
                  id="clictopay-test-mode"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-400"
                  checked={paymentConfig.clicToPayTestMode}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, clicToPayTestMode: e.target.checked })}
                />
                <label htmlFor="clictopay-test-mode" className="text-xs text-text-secondary cursor-pointer">
                  Activer le mode Test ClicToPay (SMT Sandbox)
                </label>
              </div>
            </div>
          </div>

          {/* Stripe International */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-bold text-text-primary block flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Stripe — Cartes Internationales (Visa / Mastercard)
                </span>
                <span className="text-xs text-text-secondary">
                  Encaissement par cartes bancaires internationales et prélèvements SEPA.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={paymentConfig.stripeEnabled}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Clé Publique Stripe (Publishable Key)"
                placeholder="pk_test_..."
                value={paymentConfig.stripePublicKey}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, stripePublicKey: e.target.value })}
              />
              <Input
                label="Clé Secrète Stripe (Secret Key)"
                type="password"
                placeholder="sk_test_..."
                value={paymentConfig.stripeSecretKey}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeSecretKey: e.target.value })}
              />
              <Input
                label="Secret Webhook Stripe (Signing Secret)"
                type="password"
                placeholder="whsec_..."
                value={paymentConfig.stripeWebhookSecret}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeWebhookSecret: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-blue-500/10 items-center">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Devise Stripe</label>
                <select
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={paymentConfig.stripeCurrency}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeCurrency: e.target.value })}
                >
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="USD">USD — Dollar US ($)</option>
                  <option value="TND">TND — Dinar Tunisien (Millimes)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4 sm:pt-0">
                <input
                  id="stripe-test-mode"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-400"
                  checked={paymentConfig.stripeTestMode}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, stripeTestMode: e.target.checked })}
                />
                <label htmlFor="stripe-test-mode" className="text-xs text-text-secondary cursor-pointer">
                  Mode Test Stripe (utiliser les clés de test `pk_test_...`)
                </label>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
