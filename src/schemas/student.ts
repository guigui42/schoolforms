import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string().min(1, 'ID requis'),
  firstName: z.string().min(1, 'Prénom requis').max(50, 'Prénom trop long'),
  lastName: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  birthDate: z.date({
    message: 'Date de naissance invalide',
  }),
  grade: z.enum([
    'CP', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème', '5ème', '4ème', '3ème',
    'Seconde', 'Première', 'Terminale'
  ], {
    message: 'Classe requise',
  }),
  school: z.string().min(1, 'École requise').max(100, 'Nom d\'école trop long'),
  photoAuthorization: z.boolean().default(false),
  transportAuthorization: z.boolean().default(false),
  specialNeeds: z.string().max(500, 'Commentaire trop long').optional(),
  medicalInfo: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    notes: z.string().max(1000, 'Notes médicales trop longues').optional(),
  }).optional(),
  activities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    selected: z.boolean(),
    schedule: z.string().optional(),
  })).optional(),
});

export type StudentFormData = z.infer<typeof StudentSchema>;
