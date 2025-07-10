import type { Address, EmergencyContact, MedicalInfo, Activity, Grade, ParentType } from './common';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  grade: Grade;
  school: string;
  medicalInfo?: MedicalInfo;
  activities?: Activity[];
  photoAuthorization?: boolean;
  transportAuthorization?: boolean;
  specialNeeds?: string;
}

export interface Parent {
  id: string;
  type: ParentType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession?: string;
  workAddress?: Address;
  workPhone?: string;
  emergencyContact?: boolean;
}

export interface Family {
  id: string;
  students: Student[];
  parents: Parent[];
  address: Address;
  emergencyContacts: EmergencyContact[];
  preferences: FamilyPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyPreferences {
  language: 'fr' | 'en';
  notifications: boolean;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export type FormType = 'periscolaire' | 'edpp' | 'engagement' | 'alsh';

export interface FormData {
  formType: FormType;
  studentId: string;
  data: Record<string, unknown>;
  completed: boolean;
  lastSaved: Date;
}

export interface DataReusageMap {
  [formType: string]: {
    [fieldName: string]: {
      sourceField: string;
      sourceTable: 'students' | 'parents' | 'family';
      transformation?: (value: unknown, context?: unknown) => unknown;
      required: boolean;
    };
  };
}

export interface SharedFormData {
  student: Partial<Student>;
  parents: Partial<Parent>[];
  family: Partial<Family>;
}
