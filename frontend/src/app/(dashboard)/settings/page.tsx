'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Building, Bell, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, loadUser } = useAuthStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');

  useEffect(() => {
    if (tabParam && ['profile', 'appearance', 'establishment', 'notifications', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [estName, setEstName] = useState('');
  const [estAddress, setEstAddress] = useState('');
  const [estPhone, setEstPhone] = useState('');
  const [estEmail, setEstEmail] = useState('');
  const [estId, setEstId] = useState<string | null>(null);
  const [estLoading, setEstLoading] = useState(false);
  const [estMessage, setEstMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [emailNotif, setEmailNotif] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('bsofts_notif_email') !== 'false' : true);
  const [smsNotif, setSmsNotif] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('bsofts_notif_sms') === 'true' : false);
  const [attendanceAlert, setAttendanceAlert] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('bsofts_notif_attendance') !== 'false' : true);
  const [paymentReminder, setPaymentReminder] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('bsofts_notif_payment') !== 'false' : true);
  const [notifMessage, setNotifMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { id: 'profile', name: t('settings.profile'), icon: User },
    { id: 'appearance', name: t('settings.appearance'), icon: Palette },
    { id: 'establishment', name: t('settings.establishment'), icon: Building },
    { id: 'notifications', name: t('settings.notifications'), icon: Bell },
    { id: 'security', name: t('settings.security'), icon: Shield },
  ];

  const fetchEstablishment = useCallback(async () => {
    try {
      const res = await api.get('/establishments', { params: { limit: 1 } }).catch(() => ({ data: null }));
      const data = res.data?.data?.[0] || res.data?.data || res.data;
      if (data && typeof data === 'object') {
        setEstId(data.id || '');
        setEstName(data.name || '');
        setEstAddress(data.address || '');
        setEstPhone(data.phone || '');
        setEstEmail(data.email || '');
      }
    } catch {
      // establishment may not exist yet
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'establishment') {
      fetchEstablishment();
    }
  }, [activeTab, fetchEstablishment]);

  const handleEstablishmentSave = async () => {
    setEstLoading(true);
    setEstMessage(null);
    try {
      if (estId) {
        await api.put(`/establishments/${estId}`, { name: estName, address: estAddress, phone: estPhone, email: estEmail });
      } else {
        const res = await api.post('/establishments', { name: estName, address: estAddress, phone: estPhone, email: estEmail });
        const createdId = res.data?.data?.id || res.data?.id;
        if (createdId) setEstId(createdId);
      }
      setEstMessage({ type: 'success', text: t('common.saveChanges') + ' ✓' });
    } catch {
      setEstMessage({ type: 'error', text: t('settings.profileFailed') });
    } finally {
      setEstLoading(false);
    }
  };

  const handleNotificationsSave = () => {
    setNotifMessage(null);
    localStorage.setItem('bsofts_notif_email', String(emailNotif));
    localStorage.setItem('bsofts_notif_sms', String(smsNotif));
    localStorage.setItem('bsofts_notif_attendance', String(attendanceAlert));
    localStorage.setItem('bsofts_notif_payment', String(paymentReminder));
    setNotifMessage({ type: 'success', text: t('common.saveChanges') + ' ✓' });
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileMessage(null);
    try {
      await api.put('/auth/profile', { firstName, lastName });
      await loadUser();
      setProfileMessage({ type: 'success', text: t('settings.profileUpdated') });
    } catch {
      setProfileMessage({ type: 'error', text: t('settings.profileFailed') });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('settings.passwordsDoNotMatch') });
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: t('settings.passwordUpdated') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMessage({ type: 'error', text: t('settings.passwordFailed') });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('pages.settingsTitle')}</h1>
        <p className="text-text-secondary">{t('pages.settingsDesc')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-48 overflow-x-auto">
          <nav className="flex sm:flex-col gap-1 sm:space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-muted text-brand'
                    : 'text-text-primary hover:bg-surface-hover'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">{t('settings.profileSettings')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-brand-muted flex items-center justify-center">
                      <span className="text-2xl text-brand font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-text-tertiary">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('settings.firstName')}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      label={t('settings.lastName')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <Input label={t('common.email')} type="email" defaultValue={user?.email} disabled />
                  {profileMessage && (
                    <p className={`text-sm ${profileMessage.type === 'success' ? 'text-success' : 'text-destructive'}`}>
                      {profileMessage.text}
                    </p>
                  )}
                  <Button onClick={handleProfileSave} isLoading={profileLoading}>
                    {t('common.saveChanges')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">{t('settings.appearance')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <p className="font-medium text-text-primary mb-2">{t('settings.theme')}</p>
                    <p className="text-sm text-text-tertiary mb-3">{t('settings.selectTheme')}</p>
                    <ThemeToggle />
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="font-medium text-text-primary mb-2">{t('settings.language')}</p>
                    <p className="text-sm text-text-tertiary mb-3">{t('settings.chooseLanguage')}</p>
                    <LanguageSelector />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'establishment' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">{t('settings.establishmentSettings')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-lg">
                  <Input label={t('settings.establishmentName')} placeholder="Your School Name" value={estName} onChange={(e) => setEstName(e.target.value)} />
                  <Input label={t('common.address')} placeholder="School Address" value={estAddress} onChange={(e) => setEstAddress(e.target.value)} />
                  <Input label={t('common.phone')} placeholder="+216 XXX XXX XXX" value={estPhone} onChange={(e) => setEstPhone(e.target.value)} />
                  <Input label={t('common.email')} type="email" placeholder="school@example.com" value={estEmail} onChange={(e) => setEstEmail(e.target.value)} />
                  {estMessage && (
                    <p className={`text-sm ${estMessage.type === 'success' ? 'text-success' : 'text-destructive'}`}>
                      {estMessage.text}
                    </p>
                  )}
                  <Button onClick={handleEstablishmentSave} isLoading={estLoading}>{t('common.saveChanges')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">{t('settings.notificationPreferences')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: t('settings.emailNotifications'), description: t('settings.emailNotificationsDesc'), checked: emailNotif, onChange: setEmailNotif },
                    { label: t('settings.smsNotifications'), description: t('settings.smsNotificationsDesc'), checked: smsNotif, onChange: setSmsNotif },
                    { label: t('settings.attendanceAlerts'), description: t('settings.attendanceAlertsDesc'), checked: attendanceAlert, onChange: setAttendanceAlert },
                    { label: t('settings.paymentReminders'), description: t('settings.paymentRemindersDesc'), checked: paymentReminder, onChange: setPaymentReminder },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-border-subtle">
                      <div>
                        <p className="font-medium text-text-primary">{item.label}</p>
                        <p className="text-sm text-text-tertiary">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} />
                        <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-colors peer-checked:bg-brand"></div>
                      </label>
                    </div>
                  ))}
                  {notifMessage && (
                    <p className={`text-sm ${notifMessage.type === 'success' ? 'text-success' : 'text-destructive'}`}>
                      {notifMessage.text}
                    </p>
                  )}
                  <Button onClick={handleNotificationsSave}>{t('common.saveChanges')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">{t('settings.securitySettings')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-lg">
                  <Input
                    label={t('settings.currentPassword')}
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    label={t('settings.newPassword')}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    label={t('settings.confirmNewPassword')}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordMessage && (
                    <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-success' : 'text-destructive'}`}>
                      {passwordMessage.text}
                    </p>
                  )}
                  <Button onClick={handlePasswordChange} isLoading={passwordLoading}>
                    {t('settings.updatePassword')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
