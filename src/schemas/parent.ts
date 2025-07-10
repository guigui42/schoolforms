import { z } from 'zod';

// Phone number validation for French format
const phoneRegex = /^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/;

export const ParentSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  type: z.enum(['mother', 'father', 'guardian'], {
    message: 'Type de parent requis',
  }),
  firstName: z.string().min(1, 'Prénom requis').max(50, 'Prénom trop long'),
  lastName: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(phoneRegex, 'Numéro de téléphone invalide'),
  profession: z.string().max(100, 'Profession trop longue').optional(),
  workAddress: z.object({
    street: z.string().max(200, 'Adresse trop longue'),
    city: z.string().max(100, 'Ville trop longue'),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    country: z.string().max(50, 'Pays trop long').default('France'),
  }).optional(),
  workPhone: z.string().regex(phoneRegex, 'Numéro de téléphone invalide').optional(),
  emergencyContact: z.boolean().default(false),
});

export const AddressSchema = z.object({
  street: z.string().min(1, 'Adresse requise').max(200, 'Adresse trop longue'),
  city: z.string().min(1, 'Ville requise').max(100, 'Ville trop longue'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  country: z.string().max(50, 'Pays trop long').default('France'),
});

export const EmergencyContactSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  firstName: z.string().min(1, 'Prénom requis').max(50, 'Prénom trop long'),
  lastName: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  relationship: z.string().min(1, 'Lien de parenté requis').max(50, 'Lien trop long'),
  phone: z.string().regex(phoneRegex, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional(),
  address: AddressSchema.optional(),
});

export const FamilyPreferencesSchema = z.object({
  language: z.enum(['fr', 'en']).default('fr'),
  notifications: z.boolean().default(true),
  autoSave: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
});

export const FamilySchema = z.object({
  id: z.string().min(1, 'ID requis'),
  students: z.array(z.string()).min(1, 'Au moins un enfant requis'), // Student IDs
  parents: z.array(ParentSchema).min(1, 'Au moins un parent requis'),
  address: AddressSchema,
  emergencyContacts: z.array(EmergencyContactSchema).min(1, 'Au moins un contact d\'urgence requis'),
  preferences: FamilyPreferencesSchema,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ParentFormData = z.infer<typeof ParentSchema>;
export type AddressFormData = z.infer<typeof AddressSchema>;
export type EmergencyContactFormData = z.infer<typeof EmergencyContactSchema>;
export type FamilyPreferencesFormData = z.infer<typeof FamilyPreferencesSchema>;
export type FamilyFormData = z.infer<typeof FamilySchema>;
