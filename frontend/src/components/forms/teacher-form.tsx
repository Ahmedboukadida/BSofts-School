'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import {
  User,
  Briefcase,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Coins,
  ShieldCheck,
} from 'lucide-react';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string | null;
  onSuccess: () => void;
}

interface TeacherData {
  // Step 1: Identité & Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cin: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  photo: string;

  // Step 2: Qualifications & Contrat TND
  specialization: string;
  degree: string;
  contractType: string;
  salary: number;
  hourlyRate: number;
  weeklyHours: number;
  hireDate: string;

  // Step 3: Affectations & Présentation
  selectedMatieres: string[];
  selectedClasses: string[];
  bio: string;
}

const initialTeacherData: TeacherData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cin: '',
  gender: 'MALE',
  dateOfBirth: '',
  address: '',
  photo: '',
  specialization: '',
  degree: 'Master / Mastère',
  contractType: 'CDI',
  salary: 1800,
  hourlyRate: 35,
  weeklyHours: 18,
  hireDate: new Date().toISOString().split('T')[0],
  selectedMatieres: [],
  selectedClasses: [],
  bio: '',
};

export function TeacherForm({ isOpen, onClose, teacherId, onSuccess }: TeacherFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TeacherData>(initialTeacherData);
  const [matieresList, setMatieresList] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [classesList, setClassesList] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const fetchDependencies = useCallback(async () => {
    try {
      const [matRes, clsRes] = await Promise.all([
        api.get('/matieres?limit=100').catch(() => ({ data: { data: [] } })),
        api.get('/classes?limit=100').catch(() => ({ data: { data: [] } })),
      ]);
      setMatieresList(matRes.data.data || []);
      setClassesList(clsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dependencies:', err);
    }
  }, []);

  const fetchTeacher = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await api.get(`/teachers/${teacherId}`);
      const teacher = response.data;
      setFormData({
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        cin: teacher.cin || '',
        gender: teacher.gender || 'MALE',
        dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : '',
        address: teacher.address || '',
        photo: teacher.photo || '',
        specialization: teacher.specialization || '',
        degree: teacher.degree || 'Master / Mastère',
        contractType: teacher.contracts?.[0]?.type || 'CDI',
        salary: Number(teacher.contracts?.[0]?.salary) || 1800,
        hourlyRate: Number(teacher.contracts?.[0]?.hourlyRate) || 35,
        weeklyHours: Number(teacher.contracts?.[0]?.weeklyHours) || 18,
        hireDate: teacher.hireDate ? new Date(teacher.hireDate).toISOString().split('T')[0] : '',
        selectedMatieres: teacher.matieres?.map((m: { matiereId?: string; id?: string }) => m.matiereId || m.id || '') || [],
        selectedClasses: [],
        bio: teacher.bio || '',
      });
    } catch (err) {
      console.error('Failed to fetch teacher:', err);
    }
  }, [teacherId]);

  const resetForm = useCallback(() => {
    setFormData(initialTeacherData);
    setCurrentStep(1);
    setError('');
    setStepErrors({});
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (teacherId) {
        fetchTeacher();
      } else {
        resetForm();
      }
    }
  }, [isOpen, teacherId, fetchDependencies, fetchTeacher, resetForm]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = t('studentForm.firstNameRequired') || 'Le prénom est requis';
      if (!formData.lastName.trim()) errors.lastName = t('studentForm.lastNameRequired') || 'Le nom est requis';
      if (!formData.email.trim()) errors.email = t('teacherForm.emailRequired') || "L'adresse email est requise";
    } else if (step === 2) {
      if (!formData.specialization.trim()) errors.specialization = t('teacherForm.specializationRequired') || 'La spécialisation est requise';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleMatiere = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMatieres: prev.selectedMatieres.includes(id)
        ? prev.selectedMatieres.filter((m) => m !== id)
        : [...prev.selectedMatieres, id],
    }));
  };

  const toggleClass = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(id)
        ? prev.selectedClasses.filter((c) => c !== id)
        : [...prev.selectedClasses, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        specialization: formData.specialization || undefined,
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : undefined,
        address: formData.address || undefined,
        photo: formData.photo || undefined,
        bio: formData.bio || undefined,
        establishmentId: user?.establishmentId,
      };

      if (teacherId) {
        await api.put(`/teachers/${teacherId}`, payload);
      } else {
        await api.post('/teachers', payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, label: t('teacherForm.step1Title') || 'Identité & Contact', icon: User },
    { number: 2, label: t('teacherForm.step2Title') || 'Contrat & Rémunération', icon: Briefcase },
    { number: 3, label: t('teacherForm.step3Title') || 'Matières & Affectations', icon: BookOpen },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherId ? (t('teacherForm.editTeacherModal') || "Modifier l'enseignant") : (t('teacherForm.recruitTeacherModal') || "Recrutement d'un enseignant")}
      size="6xl"
    >
      <div className="space-y-6">
        {/* Stepper Header */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => {
                    if (isCompleted || validateStep(currentStep)) {
                      setCurrentStep(step.number);
                    }
                  }}
                  className={`flex items-center gap-3 text-left transition-all p-2 rounded-xl ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : isCompleted
                      ? 'text-text-primary hover:bg-surface-hover'
                      : 'text-text-secondary opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-surface-hover text-text-secondary border border-border'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      {t('studentForm.stepLabel') || 'Étape'} {step.number}
                    </p>
                    <p className="text-sm font-medium leading-none mt-0.5">{step.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-coral/10 border border-coral/20 text-coral text-sm rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Identité & Contact */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h4 className="text-base font-semibold text-text-primary">{t('teacherForm.coordinatesTitle') || "Coordonnées de l'Enseignant"}</h4>
                <p className="text-xs text-text-secondary">{t('teacherForm.step1Desc') || "Informations d'identification et de contact"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={`${t('pages.firstName')} *`}
                    placeholder="Ex: Monia"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  {stepErrors.firstName && (
                    <p className="text-xs text-coral mt-1">{stepErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Input
                    label={`${t('pages.lastName')} *`}
                    placeholder="Ex: Trabelsi"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                  {stepErrors.lastName && (
                    <p className="text-xs text-coral mt-1">{stepErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <Input
                    label={t('teacherForm.academicEmail') || 'Email académique / professionnel *'}
                    type="email"
                    placeholder={t('teacherForm.academicEmailPlaceholder') || 'm.trabelsi@ecole.tn'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {stepErrors.email && (
                    <p className="text-xs text-coral mt-1">{stepErrors.email}</p>
                  )}
                </div>

                <Input
                  label={t('teacherForm.mobilePhone') || 'Téléphone mobile'}
                  placeholder="+216 98 765 432"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <Input
                  label={t('teacherForm.cinLabel') || "N° CIN / Carte d'identité nationale"}
                  placeholder={t('teacherForm.cinPlaceholder') || 'Ex: 08765432'}
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                />

                <Select
                  label={t('common.gender')}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: 'FEMALE', label: t('teacherForm.genderWoman') || 'Féminin (Femme)' },
                    { value: 'MALE', label: t('teacherForm.genderMan') || 'Masculin (Homme)' },
                  ]}
                />

                <div className="sm:col-span-2">
                  <Input
                    label={t('teacherForm.residenceAddress') || 'Adresse de résidence'}
                    placeholder="Ex: Avenue Habib Bourguiba, Ariana"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Qualifications & Contrat TND */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h4 className="text-base font-semibold text-text-primary">{t('teacherForm.contractTitle') || 'Contrat & Rémunération en Dinars Tunisiens (TND)'}</h4>
                <p className="text-xs text-text-secondary">{t('teacherForm.contractSub') || 'Définition de la grille salariale et du temps de travail'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={t('teacherForm.specializationLabel') || 'Discipline / Spécialisation principale *'}
                    placeholder={t('teacherForm.specializationPlaceholder') || 'Ex: Mathématiques, Sciences Physiques, Français...'}
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                  {stepErrors.specialization && (
                    <p className="text-xs text-coral mt-1">{stepErrors.specialization}</p>
                  )}
                </div>

                <Select
                  label={t('teacherForm.highestDegree') || 'Diplôme le plus élevé'}
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  options={[
                    { value: 'Licence', label: t('teacherForm.degreeLicence') || 'Licence Fondamentale / Appliquée' },
                    { value: 'Master / Mastère', label: t('teacherForm.degreeMaster') || 'Master / Mastère Professionnel' },
                    { value: 'CAPES / Agrégation', label: t('teacherForm.degreeCapes') || 'CAPES ou Agrégation' },
                    { value: 'Doctorat', label: t('teacherForm.degreeDoctorate') || 'Doctorat / Ph.D' },
                    { value: 'Autre', label: t('teacherForm.degreeOther') || 'Autre certification pédagogique' },
                  ]}
                />

                <Select
                  label={t('teacherForm.contractType') || 'Type de contrat'}
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  options={[
                    { value: 'CDI', label: t('teacherForm.contractCdi') || 'CDI (Contrat à Durée Indéterminée)' },
                    { value: 'CDD', label: t('teacherForm.contractCdd') || 'CDD (Contrat à Durée Déterminée)' },
                    { value: 'HOURLY', label: t('teacherForm.contractHourly') || 'Vacataire (Paiement par heure de cours)' },
                    { value: 'PER_SESSION', label: t('teacherForm.contractPerSession') || 'Formateur par session' },
                  ]}
                />

                <Input
                  label={t('teacherForm.hireDate') || "Date d'embauche"}
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />

                {formData.contractType === 'HOURLY' ? (
                  <div>
                    <Input
                      label={t('teacherForm.hourlyRateLabel') || 'Taux horaire net (TND / heure) *'}
                      type="number"
                      step="0.5"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      {t('teacherForm.hourlyRateSub') || 'Facturé selon les présences validées dans le carnet de séances'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Input
                      label={t('teacherForm.monthlySalaryLabel') || 'Salaire mensuel de base (TND net) *'}
                      type="number"
                      step="10"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      {t('teacherForm.monthlySalarySub') || 'Devise officielle de règlement : Dinars Tunisiens (TND)'}
                    </p>
                  </div>
                )}

                <Input
                  label={t('teacherForm.weeklyHoursLabel') || 'Volume horaire hebdomadaire (Heures / semaine)'}
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                      {t('teacherForm.estimatedSalary') || 'Rémunération estimée'}
                    </p>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                      {formData.contractType === 'HOURLY'
                        ? `${(formData.hourlyRate * formData.weeklyHours * 4).toFixed(2)} ${t('teacherForm.hourlyEstimatedMonth') || 'TND / mois estimé'}`
                        : `${Number(formData.salary).toFixed(2)} ${t('teacherForm.netSalaryTag') || 'TND net'}`}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  {t('teacherForm.estimatedSalarySub') || 'Calcul automatique selon la caisse centrale'}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Affectations & Présentation */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h4 className="text-base font-semibold text-text-primary">{t('teacherForm.subjectsTitle') || 'Matières & Affectations Pédagogiques'}</h4>
                <p className="text-xs text-text-secondary">{t('teacherForm.subjectsSub') || 'Assignez les matières enseignées et ajoutez sa notice biographique'}</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
                  {t('teacherForm.taughtSubjectsLabel') || 'Matières enseignées'} ({matieresList.length} {t('teacherForm.availableTag') || 'disponibles'})
                </label>
                {matieresList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 border border-border rounded-xl">
                    {matieresList.map((m) => {
                      const isSelected = formData.selectedMatieres.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMatiere(m.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary font-semibold'
                              : 'border-border/60 bg-surface hover:bg-surface-hover text-text-primary'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-primary border-primary text-white' : 'border-border'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary italic">{t('teacherForm.noSubjectsConfigured') || 'Aucune matière configurée pour cet établissement.'}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 block">
                  {t('teacherForm.assignedClassesLabel') || 'Classes concernées'}
                </label>
                {classesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {classesList.map((c) => {
                      const isSelected = formData.selectedClasses.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleClass(c.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'border-border bg-surface hover:bg-surface-hover text-text-primary'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary italic">{t('teacherForm.noClassesConfigured') || 'Aucune classe disponible.'}</p>
                )}
              </div>

              <div>
                <Textarea
                  label={t('teacherForm.bioPresentation') || 'Présentation & Biographie'}
                  placeholder={t('teacherForm.bioPlaceholder') || "Expérience, parcours universitaire, méthodologies d'enseignement..."}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              {currentStep > 1 ? (
                <Button type="button" variant="secondary" onClick={handlePrev} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('studentForm.prevStep') || 'Précédent'}
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={onClose}>
                  {t('common.cancel') || 'Annuler'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="gap-2">
                  {t('studentForm.nextStep') || 'Suivant'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" isLoading={isLoading} className="gap-2 bg-primary hover:bg-primary/90">
                  <Check className="w-4 h-4" />
                  {teacherId ? (t('studentForm.saveChanges') || 'Enregistrer les modifications') : (t('teacherForm.createTeacher') || "Créer l'enseignant")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
