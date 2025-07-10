// Application constants for the school forms app

export const APP_NAME = 'SchoolForms';
export const APP_VERSION = '1.0.0';

export const FORM_TYPES = {
  PERISCOLAIRE: 'periscolaire',
  EDPP: 'edpp',
  ENGAGEMENT: 'engagement',
  ALSH: 'alsh',
} as const;

export const FORM_LABELS = {
  [FORM_TYPES.PERISCOLAIRE]: 'Périscolaire',
  [FORM_TYPES.EDPP]: 'EDPP - Mercredis & Vacances',
  [FORM_TYPES.ENGAGEMENT]: 'Contrat d\'engagement',
  [FORM_TYPES.ALSH]: 'ALSH - Dossier d\'inscription',
} as const;

export const GRADES = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  '6ème', '5ème', '4ème', '3ème',
  'Seconde', 'Première', 'Terminale',
] as const;

export const PARENT_TYPES = {
  MOTHER: 'mother',
  FATHER: 'father',
  GUARDIAN: 'guardian',
} as const;

export const PARENT_LABELS = {
  [PARENT_TYPES.MOTHER]: 'Mère',
  [PARENT_TYPES.FATHER]: 'Père',
  [PARENT_TYPES.GUARDIAN]: 'Tuteur/Tutrice',
} as const;

export const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const;

export const STORAGE_KEYS = {
  FAMILIES: 'school-forms-families',
  FORM_DATA: 'school-forms-data',
  PREFERENCES: 'school-forms-preferences',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Ce champ est requis',
  EMAIL: 'Veuillez entrer un email valide',
  PHONE: 'Veuillez entrer un numéro de téléphone valide',
  POSTAL_CODE: 'Veuillez entrer un code postal valide',
  DATE: 'Veuillez entrer une date valide',
  MIN_LENGTH: (min: number) => `Minimum ${min} caractères`,
  MAX_LENGTH: (max: number) => `Maximum ${max} caractères`,
} as const;

export const PDF_TEMPLATES = {
  [FORM_TYPES.PERISCOLAIRE]: '/templates/PERISCOLAIRE – 2025-2026 - Fiche d\'inscription (1).pdf',
  [FORM_TYPES.EDPP]: '/templates/Fiche d\'inscription EDPP - Mercredis Vacs sco 25-26.pdf',
  [FORM_TYPES.ENGAGEMENT]: '/templates/EDPP Contrat d\'engagement 2025-2026.pdf',
  [FORM_TYPES.ALSH]: '/templates/Dossier d\'inscription ALSH - EDPP 2025-2026.pdf',
} as const;
