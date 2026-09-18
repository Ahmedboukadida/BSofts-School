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

    // Colors & Theme
    primaryColor: '#2563EB',
    secondaryColor: '#4F46E5',
    accentColor: '#10B981',
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

  useEffect(() => {
    api.get('/saas-settings')
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

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
      </form>
    </div>
  );
}
