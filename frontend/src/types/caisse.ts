export interface Caisse {
  id: string;
  name: string;
  code: string;
  type: 'PRINCIPALE' | 'SECONDAIRE' | 'BANQUE';
  balance: number;
  currency: string;
  establishmentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaisseTransaction {
  id: string;
  receiptNumber: string;
  date: string;
  studentName?: string;
  caisseId?: string;
  caisse?: Caisse;
  amount: number;
  currency: string;
  method: 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'CARD';
  cashierName?: string;
  category: 'TUITION' | 'REGISTRATION' | 'TRANSPORT' | 'CANTEEN' | 'BOOKS' | 'TRANSFER' | 'OTHER';
  notes?: string;
  status: 'CONFIRMED' | 'VOIDED';
}

export interface CaisseTransferPayload {
  fromCaisseId: string;
  toCaisseId: string;
  amount: number;
  notes?: string;
}

export interface CaisseFormData {
  name: string;
  code: string;
  type: 'PRINCIPALE' | 'SECONDAIRE' | 'BANQUE';
  initialBalance?: number;
}
