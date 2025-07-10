// Common types for the school forms application

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
}

export interface MedicalInfo {
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  selected: boolean;
  schedule?: string;
}

export type Grade = 
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' 
  | '6ème' | '5ème' | '4ème' | '3ème'
  | 'Seconde' | 'Première' | 'Terminale';

export type ParentType = 'mother' | 'father' | 'guardian';

export interface ValidationError {
  field: string;
  message: string;
}
