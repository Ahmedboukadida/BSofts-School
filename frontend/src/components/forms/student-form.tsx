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
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string | null;
  onSuccess: () => void;
}

interface StudentData {
  // Step 1: Identité & État Civil
  firstName: string;
  lastName: string;
  registrationNumber: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  bloodGroup: string;
  photo: string;

  // Step 2: Scolarité & Classe
  classId: string;
  enrollmentDate: string;
  regime: string; // EXTERNE, DEMI_PENSIONNAIRE, INTERNE
  status: string; // ACTIVE, PENDING, TRANSFERRED

  // Step 3: Famille & Contact d'urgence
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyPhone: string;
  email: string;
  phone: string;
  address: string;
  medicalNotes: string;
  bio: string;
}

const initialFormData: StudentData = {
  firstName: '',
  lastName: '',
  registrationNumber: '',
  gender: 'MALE',
  dateOfBirth: '',
  placeOfBirth: '',
  nationality: 'Tunisienne',
  bloodGroup: 'O+',
  photo: '',
  classId: '',
  enrollmentDate: new Date().toISOString().split('T')[0],
  regime: 'DEMI_PENSIONNAIRE',
  status: 'ACTIVE',
  parentId: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  emergencyPhone: '',
  email: '',
  phone: '',
  address: '',
  medicalNotes: '',
  bio: '',
};

export function StudentForm({ isOpen, onClose, studentId, onSuccess }: StudentFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudentData>(initialFormData);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [parents, setParents] = useState<{ id: string; firstName: string; lastName: string; phone?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const generateMatricule = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, registrationNumber: `ETU-${year}-${random}` }));
  };

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/classes?limit=100');
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  }, []);

  const fetchParents = useCallback(async () => {
    try {
      const response = await api.get('/parents?limit=100');
      setParents(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch parents:', err);
    }
  }, []);

  const fetchStudent = useCallback(async () => {
    if (!studentId) return;
    try {
      const response = await api.get(`/students/${studentId}`);
      const student = response.data;
      const primaryParent = student.parents?.[0]?.parent;
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        registrationNumber: student.registrationNumber || '',
        gender: student.gender || 'MALE',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        placeOfBirth: student.placeOfBirth || '',
        nationality: student.nationality || 'Tunisienne',
        bloodGroup: student.bloodGroup || 'O+',
        photo: student.photo || '',
        classId: student.classAssignments?.[0]?.class?.id || '',
        enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        regime: student.regime || 'DEMI_PENSIONNAIRE',
        status: student.isActive ? 'ACTIVE' : 'INACTIVE',
        parentId: primaryParent?.id || '',
        parentName: primaryParent ? `${primaryParent.firstName} ${primaryParent.lastName}` : '',
        parentPhone: primaryParent?.phone || '',
        parentEmail: primaryParent?.email || '',
        emergencyPhone: student.emergencyPhone || student.phone || '',
        email: student.user?.email || '',
        phone: student.phone || '',
        address: student.address || '',
        medicalNotes: student.medicalNotes || '',
        bio: student.bio || '',
      });
    } catch (err) {
      console.error('Failed to fetch student:', err);
    }
  }, [studentId]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setError('');
    setStepErrors({});
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      fetchParents();
      if (studentId) {
        fetchStudent();
      } else {
        resetForm();
        // Auto-generate a matricule if creating
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        setFormData((prev) => ({ ...prev, registrationNumber: `ETU-${year}-${random}` }));
      }
    }
  }, [isOpen, studentId, fetchClasses, fetchParents, fetchStudent, resetForm]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = t('studentForm.firstNameRequired') || 'Le prénom est requis';
      if (!formData.lastName.trim()) errors.lastName = t('studentForm.lastNameRequired') || 'Le nom est requis';
      if (!formData.registrationNumber.trim()) errors.registrationNumber = t('studentForm.matriculeRequired') || 'Le matricule est requis';
    } else if (step === 2) {
      // Step 2 is academic - class is optional but recommended
    } else if (step === 3) {
      // Step 3 is parents / emergency
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        registrationNumber: formData.registrationNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        photo: formData.photo || undefined,
        establishmentId: user?.establishmentId,
      };

      if (formData.email) payload.email = formData.email;
      if (formData.classId) payload.classId = formData.classId;

      if (studentId) {
        await api.put(`/students/${studentId}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          photo: formData.photo || undefined,
        });
      } else {
        await api.post('/students', payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      setError(errorObj.response?.data?.error?.message || errorObj.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, label: t('studentForm.step1Title') || 'Identité & État Civil', icon: User, desc: t('studentForm.step1Desc') || 'Informations personnelles de base' },
    { number: 2, label: t('studentForm.step2Title') || 'Scolarité & Classe', icon: GraduationCap, desc: t('studentForm.step2Desc') || 'Affectation et inscription' },
    { number: 3, label: t('studentForm.step3Title') || 'Famille & Urgence', icon: HeartHandshake, desc: t('studentForm.step3Desc') || 'Responsables légaux et santé' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentId ? (t('studentForm.editStudentModal') || 'Modifier le dossier élève') : (t('studentForm.studentRegistrationModal') || "Inscription d'un nouvel élève")}
      size="6xl"
    >
      <div className="space-y-6">
        {/* Wizard Stepper Header */}
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

          {/* Progress bar line */}
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
          {/* STEP 1: Identité & État Civil */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h4 className="text-base font-semibold text-text-primary">{t('studentForm.personalInfo') || 'Informations Personnelles'}</h4>
                  <p className="text-xs text-text-secondary">{t('studentForm.personalInfoSub') || "Renseignez l'état civil de l'apprenant"}</p>
                </div>
                <button
                  type="button"
                  onClick={generateMatricule}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('studentForm.generateMatricule') || 'Générer Matricule'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={`${t('pages.firstName')} *`}
                    placeholder="Ex: Youssef"
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
                    placeholder="Ex: Ben Salem"
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
                    label={t('studentForm.matriculeLabel') || 'Matricule national / Identifiant *'}
                    placeholder={t('studentForm.matriculePlaceholder') || 'Ex: ETU-2026-4920'}
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                  />
                  {stepErrors.registrationNumber && (
                    <p className="text-xs text-coral mt-1">{stepErrors.registrationNumber}</p>
                  )}
                </div>

                <Select
                  label={`${t('common.gender') || 'Genre'} *`}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={[
                    { value: 'MALE', label: t('studentForm.genderMale') || 'Masculin (Garçon)' },
                    { value: 'FEMALE', label: t('studentForm.genderFemale') || 'Féminin (Fille)' },
                  ]}
                />

                <Input
                  label={t('common.dateOfBirth') || 'Date de naissance'}
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />

                <Input
                  label={t('studentForm.placeOfBirth') || 'Lieu de naissance'}
                  placeholder={t('studentForm.placeOfBirthPlaceholder') || 'Ex: Tunis, Sfax, Sousse...'}
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                />

                <Select
                  label={t('common.bloodGroup') || 'Groupe sanguin'}
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  options={[
                    { value: 'O+', label: 'O Positif (O+)' },
                    { value: 'A+', label: 'A Positif (A+)' },
                    { value: 'B+', label: 'B Positif (B+)' },
                    { value: 'AB+', label: 'AB Positif (AB+)' },
                    { value: 'O-', label: 'O Négatif (O-)' },
                    { value: 'A-', label: 'A Négatif (A-)' },
                    { value: 'B-', label: 'B Négatif (B-)' },
                    { value: 'AB-', label: 'AB Négatif (AB-)' },
                  ]}
                />

                <Input
                  label={t('studentForm.nationality') || 'Nationalité'}
                  placeholder={t('studentForm.nationalityPlaceholder') || 'Ex: Tunisienne'}
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label={t('studentForm.photoUrl') || "Photo de profil (URL de l'image)"}
                  placeholder="https://..."
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Scolarité & Affectation */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h4 className="text-base font-semibold text-text-primary">{t('studentForm.schoolingTitle') || 'Scolarité & Affectation'}</h4>
                <p className="text-xs text-text-secondary">{t('studentForm.schoolingSub') || "Sélectionnez la classe et le régime de l'élève"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('studentForm.classAssignment') || "Classe d'affectation"}
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  options={[
                    { value: '', label: t('studentForm.selectClassPlaceholder') || '-- Sélectionner une classe --' },
                    ...classes.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />

                <Select
                  label={t('studentForm.regimeLabel') || 'Régime de fréquentation'}
                  value={formData.regime}
                  onChange={(e) => setFormData({ ...formData, regime: e.target.value })}
                  options={[
                    { value: 'EXTERNE', label: t('studentForm.regimeExternal') || 'Externe (Cours uniquement)' },
                    { value: 'DEMI_PENSIONNAIRE', label: t('studentForm.regimeHalfBoard') || 'Demi-pensionnaire (Cantine incluse)' },
                    { value: 'INTERNE', label: t('studentForm.regimeBoarding') || 'Interne (Hébergement complet)' },
                  ]}
                />

                <Input
                  label={t('studentForm.enrollmentDate') || "Date d'inscription"}
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                />

                <Select
                  label={t('studentForm.dossierStatus') || 'Statut du dossier'}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'ACTIVE', label: t('studentForm.statusActive') || 'Inscrit & Actif' },
                    { value: 'PENDING', label: t('studentForm.statusPending') || 'En attente de validation' },
                    { value: 'TRANSFERRED', label: t('studentForm.statusTransferred') || 'Transféré' },
                  ]}
                />
              </div>

              <div className="bg-primary/5 border border-primary/15 p-4 rounded-xl flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <span className="font-semibold text-text-primary">{t('studentForm.academicNoteTitle') || 'Note académique :'}</span> {t('studentForm.academicNoteDesc') || "L'affectation à une classe relie automatiquement l'élève à son emploi du temps hebdomadaire, aux professeurs de la classe ainsi qu'au barème des notes par trimestre/semestre."}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Famille & Urgence */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h4 className="text-base font-semibold text-text-primary">{t('studentForm.familyTitle') || 'Responsables Légaux & Contacts'}</h4>
                <p className="text-xs text-text-secondary">{t('studentForm.familySub') || 'Coordonnées des parents et informations sanitaires'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('studentForm.linkToParent') || 'Lier à un Parent / Tuteur existant'}
                  value={formData.parentId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = parents.find((p) => p.id === selId);
                    setFormData({
                      ...formData,
                      parentId: selId,
                      parentName: found ? `${found.firstName} ${found.lastName}` : '',
                      parentPhone: found?.phone || '',
                    });
                  }}
                  options={[
                    { value: '', label: t('studentForm.newParentOrNoLink') || '-- Créer un nouveau parent ou sans lien direct --' },
                    ...parents.map((p) => ({
                      value: p.id,
                      label: `${p.firstName} ${p.lastName} ${p.phone ? `(${p.phone})` : ''}`,
                    })),
                  ]}
                />

                <Input
                  label={t('studentForm.emergencyPhone') || "Téléphone d'urgence (prioritaire) *"}
                  placeholder={t('studentForm.emergencyPhonePlaceholder') || 'Ex: +216 98 123 456'}
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />

                <Input
                  label={t('studentForm.studentEmail') || "Email de l'élève (Compte d'accès)"}
                  type="email"
                  placeholder={t('studentForm.studentEmailPlaceholder') || 'youssef.bensalem@ecole.tn'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                  label={t('studentForm.studentPhone') || "Téléphone de l'élève"}
                  placeholder={t('studentForm.studentPhonePlaceholder') || 'Ex: +216 20 123 456'}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div className="sm:col-span-2">
                  <Input
                    label={t('studentForm.residenceAddress') || 'Adresse de résidence'}
                    placeholder={t('studentForm.residenceAddressPlaceholder') || 'Ex: 12 Rue de la Liberté, Menzah 6, Tunis'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    label={t('studentForm.medicalNotes') || 'Observations médicales & Allergies'}
                    placeholder={t('studentForm.medicalNotesPlaceholder') || 'Allergies alimentaires, asthme, port de lunettes, contre-indications sportives...'}
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    label={t('studentForm.administrativeBio') || 'Remarques administratives & Bio'}
                    placeholder={t('studentForm.administrativeBioPlaceholder') || "Informations complémentaires utiles pour l'équipe pédagogique..."}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
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
                  {studentId ? (t('studentForm.saveChanges') || 'Enregistrer les modifications') : (t('studentForm.confirmEnrollment') || "Valider l'inscription")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
