import { z } from 'zod';

// Enhanced medical information for EDPP
export const EDPPMedicalInfoSchema = z.object({
  // Basic medical info
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    instructions: z.string().optional(),
  })).optional(),
  conditions: z.array(z.string()).optional(),
  notes: z.string().max(1000, 'Notes médicales trop longues').optional(),
  
  // EDPP specific medical fields
  doctorName: z.string().max(100, 'Nom du médecin trop long').optional(),
  doctorPhone: z.string().max(20, 'Téléphone du médecin trop long').optional(),
  insuranceNumber: z.string().max(50, 'Numéro d\'assurance trop long').optional(),
  vaccinationUpToDate: z.boolean().default(false),
  specialDiet: z.boolean().default(false),
  specialDietDetails: z.string().max(500, 'Détails du régime spécial trop longs').optional(),
  pai: z.boolean().default(false), // Projet d'Accueil Individualisé
  paiDetails: z.string().max(1000, 'Détails PAI trop longs').optional(),
});

// Activity selection for EDPP
export const EDPPActivitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nom de l\'activité requis'),
  category: z.enum(['sport', 'art', 'culture', 'science', 'nature', 'jeux', 'autre']),
  description: z.string().optional(),
  ageGroup: z.string().optional(),
  schedule: z.string().optional(),
  location: z.string().optional(),
  price: z.number().optional(),
  selected: z.boolean().default(false),
  priority: z.number().min(1).max(10).optional(), // 1 = highest priority
});

// Schedule preferences for EDPP
export const EDPPScheduleSchema = z.object({
  // Days of the week
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  
  // Vacation periods
  autumnHolidays: z.boolean().default(false),
  winterHolidays: z.boolean().default(false),
  springHolidays: z.boolean().default(false),
  summerHolidays: z.boolean().default(false),
  
  // Time slots
  morning: z.boolean().default(false),
  lunchTime: z.boolean().default(false),
  afternoon: z.boolean().default(false),
  
  // Special periods
  pedagogicalDays: z.boolean().default(false),
  
  // Custom schedule notes
  notes: z.string().max(500, 'Notes d\'emploi du temps trop longues').optional(),
});

// Authorizations for EDPP
export const EDPPAuthorizationsSchema = z.object({
  // Photo/video authorizations
  photoAuthorization: z.boolean().default(false),
  videoAuthorization: z.boolean().default(false),
  socialMediaAuthorization: z.boolean().default(false),
  pressAuthorization: z.boolean().default(false),
  
  // Activity authorizations
  swimmingAuthorization: z.boolean().default(false),
  outdoorActivitiesAuthorization: z.boolean().default(false),
  transportAuthorization: z.boolean().default(false),
  walkingExcursionAuthorization: z.boolean().default(false),
  
  // Medical authorizations
  medicationAuthorization: z.boolean().default(false),
  emergencyMedicalAuthorization: z.boolean().default(false),
  firstAidAuthorization: z.boolean().default(false),
  
  // Special authorizations
  leaveAloneAuthorization: z.boolean().default(false),
  pickupByOthersAuthorization: z.boolean().default(false),
  authorizedPickupPersons: z.array(z.object({
    name: z.string().min(1, 'Nom requis'),
    relationship: z.string().min(1, 'Lien de parenté requis'),
    phone: z.string().min(1, 'Téléphone requis'),
  })).optional(),
});

// Enhanced parent information for EDPP
export const EDPPParentInfoSchema = z.object({
  // Basic parent info (inherited from base schema)
  id: z.string().min(1, 'ID requis'),
  type: z.enum(['mother', 'father', 'guardian'], {
    message: 'Type de parent requis',
  }),
  firstName: z.string().min(1, 'Prénom requis').max(50, 'Prénom trop long'),
  lastName: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Téléphone requis'),
  profession: z.string().max(100, 'Profession trop longue').optional(),
  
  // EDPP specific parent fields
  nationality: z.string().max(50, 'Nationalité trop longue').default('Française'),
  birthDate: z.date().optional(),
  workSchedule: z.string().max(200, 'Horaires de travail trop longs').optional(),
  workAddress: z.string().max(300, 'Adresse de travail trop longue').optional(),
  workPhone: z.string().max(20, 'Téléphone de travail trop long').optional(),
  
  // Custody and authority
  parentalAuthority: z.boolean().default(true),
  custodyDetails: z.string().max(500, 'Détails de garde trop longs').optional(),
  
  // Emergency availability
  emergencyContact: z.boolean().default(false),
  availabilityNotes: z.string().max(300, 'Notes de disponibilité trop longues').optional(),
});

// Financial information for EDPP
export const EDPPFinancialInfoSchema = z.object({
  // CAF information
  cafNumber: z.string().max(50, 'Numéro CAF trop long').optional(),
  quotientFamilial: z.number().min(0).optional(),
  
  // Payment preferences
  paymentMethod: z.enum(['virement', 'prelevement', 'cheque', 'especes']).optional(),
  iban: z.string().max(34, 'IBAN trop long').optional(),
  
  // Scholarships and aids
  scholarshipRecipient: z.boolean().default(false),
  otherFinancialAid: z.string().max(200, 'Autres aides trop longues').optional(),
  
  // Billing address (if different from home address)
  differentBillingAddress: z.boolean().default(false),
  billingAddress: z.object({
    street: z.string().max(200, 'Adresse trop longue'),
    city: z.string().max(100, 'Ville trop longue'),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    country: z.string().max(50, 'Pays trop long').default('France'),
  }).optional(),
});

// Main EDPP form schema
export const EDPPFormSchema = z.object({
  // Basic identification
  formId: z.string().min(1, 'ID du formulaire requis'),
  studentId: z.string().min(1, 'ID de l\'étudiant requis'),
  academicYear: z.string().min(1, 'Année scolaire requise').default('2025-2026'),
  
  // Enhanced student information
  studentInfo: z.object({
    // Basic info (from main student schema)
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    birthDate: z.date(),
    grade: z.string().min(1, 'Classe requise'),
    school: z.string().min(1, 'École requise'),
    
    // EDPP specific student fields
    nationality: z.string().max(50, 'Nationalité trop longue').default('Française'),
    birthPlace: z.string().max(100, 'Lieu de naissance trop long').optional(),
    gender: z.enum(['M', 'F'], { message: 'Sexe requis' }),
    classSection: z.string().max(10, 'Section trop longue').optional(),
    teacher: z.string().max(100, 'Nom du professeur trop long').optional(),
    
    // Address (can be different from family address)
    address: z.object({
      street: z.string().min(1, 'Adresse requise'),
      city: z.string().min(1, 'Ville requise'),
      postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
      country: z.string().default('France'),
    }),
  }),
  
  // Enhanced parent information
  parents: z.array(EDPPParentInfoSchema).min(1, 'Au moins un parent requis'),
  
  // Emergency contacts (more detailed)
  emergencyContacts: z.array(z.object({
    id: z.string(),
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    relationship: z.string().min(1, 'Lien de parenté requis'),
    phone: z.string().min(1, 'Téléphone requis'),
    email: z.string().email('Email invalide').optional(),
    address: z.string().max(300, 'Adresse trop longue').optional(),
    priority: z.number().min(1).max(3), // 1 = primary contact
    availability: z.string().max(200, 'Disponibilité trop longue').optional(),
  })).min(1, 'Au moins un contact d\'urgence requis'),
  
  // Medical information
  medicalInfo: EDPPMedicalInfoSchema,
  
  // Activities and schedule
  activities: z.array(EDPPActivitySchema),
  schedule: EDPPScheduleSchema,
  
  // Authorizations
  authorizations: EDPPAuthorizationsSchema,
  
  // Financial information
  financialInfo: EDPPFinancialInfoSchema.optional(),
  
  // Additional information
  additionalInfo: z.object({
    specialRequests: z.string().max(1000, 'Demandes spéciales trop longues').optional(),
    previousParticipation: z.boolean().default(false),
    previousParticipationDetails: z.string().max(500, 'Détails de participation précédente trop longs').optional(),
    howDidYouHear: z.string().max(200, 'Comment avez-vous entendu parler trop long').optional(),
    
    // Family composition
    siblings: z.array(z.object({
      firstName: z.string(),
      lastName: z.string(),
      birthDate: z.date(),
      participatesInEDPP: z.boolean().default(false),
    })).optional(),
  }).optional(),
  
  // Form metadata
  submissionDate: z.date().default(() => new Date()),
  lastModified: z.date().default(() => new Date()),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).default('draft'),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
});

export type EDPPMedicalInfo = z.infer<typeof EDPPMedicalInfoSchema>;
export type EDPPActivity = z.infer<typeof EDPPActivitySchema>;
export type EDPPSchedule = z.infer<typeof EDPPScheduleSchema>;
export type EDPPAuthorizations = z.infer<typeof EDPPAuthorizationsSchema>;
export type EDPPParentInfo = z.infer<typeof EDPPParentInfoSchema>;
export type EDPPFinancialInfo = z.infer<typeof EDPPFinancialInfoSchema>;
export type EDPPFormData = z.infer<typeof EDPPFormSchema>;
