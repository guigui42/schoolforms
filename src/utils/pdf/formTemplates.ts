/**
 * Form Template Definitions
 * 
 * This module defines the structure and content for each PDF form
 * instead of trying to position fields on existing PDFs.
 * We generate PDFs completely from scratch based on these templates.
 */

import type { Family, Student, Parent } from '../../types/forms';
import type { Address, EmergencyContact } from '../../types/common';

// Helper function to safely format dates
function formatDate(date: Date | string | undefined | null): string {
  if (!date) return '';
  
  try {
    // If it's already a Date object
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('fr-FR');
    }
    
    // If it's a string, try to parse it
    if (typeof date === 'string') {
      // Handle empty string
      if (date.trim() === '') return '';
      
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('fr-FR');
      }
      
      // If it's already in French format, return as-is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
      }
      
      return date; // Return as-is if it can't be parsed but looks like a date
    }
    
    return '';
  } catch (error) {
    console.warn('Error formatting date:', error, 'Input:', date);
    return String(date || '');
  }
}



// Form field types
export type FieldType = 'text' | 'date' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  validation?: RegExp;
  maxLength?: number;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  sections: FormSection[];
  
  // Function to extract data from family object
  extractData: (family: Family) => Record<string, string | boolean | number>;
}

// PERISCOLAIRE Form Template
export const PERISCOLAIRE_TEMPLATE: FormTemplate = {
  id: 'periscolaire',
  name: 'Périscolaire',
  title: 'FICHE D\'INSCRIPTION PÉRISCOLAIRE 2025-2026',
  description: 'Inscription aux activités périscolaires',
  
  sections: [
    {
      id: 'child_info',
      title: 'INFORMATIONS SUR L\'ENFANT',
      fields: [
        {
          id: 'child_lastName',
          label: 'Nom de l\'enfant',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'child_firstName',
          label: 'Prénom',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'child_birthDate',
          label: 'Date de naissance',
          type: 'date',
          required: true
        },
        {
          id: 'child_grade',
          label: 'Classe',
          type: 'select',
          required: true,
          options: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème']
        },
        {
          id: 'child_school',
          label: 'École/Établissement',
          type: 'text',
          required: true,
          maxLength: 100
        }
      ]
    },
    {
      id: 'address_info',
      title: 'ADRESSE DE L\'ENFANT',
      fields: [
        {
          id: 'address_street',
          label: 'Adresse',
          type: 'textarea',
          required: true,
          maxLength: 200
        },
        {
          id: 'address_postalCode',
          label: 'Code postal',
          type: 'text',
          required: true,
          maxLength: 10
        },
        {
          id: 'address_city',
          label: 'Ville',
          type: 'text',
          required: true,
          maxLength: 50
        }
      ]
    },
    {
      id: 'parent_info',
      title: 'REPRÉSENTANTS LÉGAUX',
      fields: [
        {
          id: 'parent1_title',
          label: 'Titre (Père/Mère/Tuteur)',
          type: 'select',
          required: true,
          options: ['Père', 'Mère', 'Tuteur légal']
        },
        {
          id: 'parent1_lastName',
          label: 'Nom',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'parent1_firstName',
          label: 'Prénom',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'parent1_phone',
          label: 'Téléphone',
          type: 'phone',
          required: true
        },
        {
          id: 'parent1_email',
          label: 'Email',
          type: 'email',
          required: true
        },
        {
          id: 'parent1_profession',
          label: 'Profession',
          type: 'text',
          maxLength: 100
        },
        {
          id: 'parent2_title',
          label: 'Titre (Père/Mère/Tuteur)',
          type: 'select',
          options: ['Père', 'Mère', 'Tuteur légal']
        },
        {
          id: 'parent2_lastName',
          label: 'Nom',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'parent2_firstName',
          label: 'Prénom',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'parent2_phone',
          label: 'Téléphone',
          type: 'phone'
        },
        {
          id: 'parent2_email',
          label: 'Email',
          type: 'email'
        },
        {
          id: 'parent2_profession',
          label: 'Profession',
          type: 'text',
          maxLength: 100
        }
      ]
    },
    {
      id: 'emergency_contact',
      title: 'PERSONNE À PRÉVENIR EN CAS D\'URGENCE',
      fields: [
        {
          id: 'emergency_lastName',
          label: 'Nom',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'emergency_firstName',
          label: 'Prénom',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'emergency_phone',
          label: 'Téléphone',
          type: 'phone',
          required: true
        },
        {
          id: 'emergency_relationship',
          label: 'Lien de parenté',
          type: 'text',
          required: true,
          maxLength: 50
        }
      ]
    },
    {
      id: 'activities',
      title: 'ACTIVITÉS DEMANDÉES',
      fields: [
        {
          id: 'garderie_matin',
          label: 'Garderie du matin (7h30-8h30)',
          type: 'checkbox'
        },
        {
          id: 'cantine',
          label: 'Cantine (12h00-13h30)',
          type: 'checkbox'
        },
        {
          id: 'garderie_soir',
          label: 'Garderie du soir (16h30-18h30)',
          type: 'checkbox'
        },
        {
          id: 'etude',
          label: 'Étude surveillée (16h30-17h30)',
          type: 'checkbox'
        }
      ]
    }
  ],
  
  extractData: (family: Family) => {
    const student = family.students[0] || {} as Student;
    const parent1 = family.parents[0] || {} as Parent;
    const parent2 = family.parents[1] || {} as Parent;
    const emergency = family.emergencyContacts[0] || {} as EmergencyContact;
    const address = family.address || {} as Address;
    
    return {
      // Child information
      child_lastName: student.lastName || '',
      child_firstName: student.firstName || '',
      child_birthDate: formatDate(student.birthDate),
      child_grade: student.grade || '',
      child_school: student.school || '',
      
      // Address
      address_street: address.street || '',
      address_postalCode: address.postalCode || '',
      address_city: address.city || '',
      
      // Parent 1
      parent1_title: parent1.type === 'father' ? 'Père' : parent1.type === 'mother' ? 'Mère' : 'Tuteur légal',
      parent1_lastName: parent1.lastName || '',
      parent1_firstName: parent1.firstName || '',
      parent1_phone: parent1.phone || '',
      parent1_email: parent1.email || '',
      parent1_profession: parent1.profession || '',
      
      // Parent 2
      parent2_title: parent2?.type === 'father' ? 'Père' : parent2?.type === 'mother' ? 'Mère' : parent2?.type === 'guardian' ? 'Tuteur légal' : '',
      parent2_lastName: parent2?.lastName || '',
      parent2_firstName: parent2?.firstName || '',
      parent2_phone: parent2?.phone || '',
      parent2_email: parent2?.email || '',
      parent2_profession: parent2?.profession || '',
      
      // Emergency contact
      emergency_lastName: emergency.lastName || '',
      emergency_firstName: emergency.firstName || '',
      emergency_phone: emergency.phone || '',
      emergency_relationship: emergency.relationship || '',
      
      // Activities (default to false, can be overridden by user preferences)
      garderie_matin: false,
      cantine: false,
      garderie_soir: false,
      etude: false
    };
  }
};

// EDPP Template
export const EDPP_TEMPLATE: FormTemplate = {
  id: 'edpp',
  name: 'EDPP',
  title: 'DOSSIER D\'INSCRIPTION ALSH - EDPP 2025-2026',
  description: 'Inscription à l\'Accueil de Loisirs Sans Hébergement - École de Pédagogie Par le Projet',
  
  sections: [
    {
      id: 'child_info',
      title: 'INFORMATIONS SUR L\'ENFANT',
      fields: [
        {
          id: 'child_lastName',
          label: 'Nom de l\'enfant',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'child_firstName',
          label: 'Prénom',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'child_birthDate',
          label: 'Date de naissance',
          type: 'date',
          required: true
        },
        {
          id: 'child_nationality',
          label: 'Nationalité',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          id: 'child_grade',
          label: 'Classe en 2025-2026',
          type: 'select',
          required: true,
          options: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème']
        }
      ]
    },
    {
      id: 'address_info',
      title: 'ADRESSE',
      fields: [
        {
          id: 'address_street',
          label: 'Adresse',
          type: 'textarea',
          required: true,
          maxLength: 200
        },
        {
          id: 'address_postalCode',
          label: 'Code postal',
          type: 'text',
          required: true,
          maxLength: 10
        },
        {
          id: 'address_city',
          label: 'Ville',
          type: 'text',
          required: true,
          maxLength: 50
        }
      ]
    },
    {
      id: 'father_info',
      title: 'INFORMATIONS PÈRE',
      fields: [
        {
          id: 'father_lastName',
          label: 'Nom du père',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'father_firstName',
          label: 'Prénom',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'father_nationality',
          label: 'Nationalité',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'father_profession',
          label: 'Profession',
          type: 'text',
          maxLength: 100
        },
        {
          id: 'father_employer',
          label: 'Employeur',
          type: 'text',
          maxLength: 100
        },
        {
          id: 'father_phone',
          label: 'Téléphone',
          type: 'phone'
        },
        {
          id: 'father_mobile',
          label: 'Mobile',
          type: 'phone'
        },
        {
          id: 'father_email',
          label: 'Email',
          type: 'email'
        }
      ]
    },
    {
      id: 'mother_info',
      title: 'INFORMATIONS MÈRE',
      fields: [
        {
          id: 'mother_maidenName',
          label: 'Nom de jeune fille',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'mother_marriedName',
          label: 'Nom marital',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'mother_firstName',
          label: 'Prénom',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'mother_nationality',
          label: 'Nationalité',
          type: 'text',
          maxLength: 50
        },
        {
          id: 'mother_profession',
          label: 'Profession',
          type: 'text',
          maxLength: 100
        },
        {
          id: 'mother_employer',
          label: 'Employeur',
          type: 'text',
          maxLength: 100
        },
        {
          id: 'mother_phone',
          label: 'Téléphone',
          type: 'phone'
        },
        {
          id: 'mother_mobile',
          label: 'Mobile',
          type: 'phone'
        },
        {
          id: 'mother_email',
          label: 'Email',
          type: 'email'
        }
      ]
    }
  ],
  
  extractData: (family: Family) => {
    const student = family.students[0] || {} as Student;
    const father = family.parents.find(p => p.type === 'father') || {} as Parent;
    const mother = family.parents.find(p => p.type === 'mother') || {} as Parent;
    const address = family.address || {} as Address;
    
    return {
      // Child information
      child_lastName: student.lastName || '',
      child_firstName: student.firstName || '',
      child_birthDate: formatDate(student.birthDate),
      child_nationality: 'Française', // Default, can be made configurable
      child_grade: student.grade || '',
      
      // Address
      address_street: address.street || '',
      address_postalCode: address.postalCode || '',
      address_city: address.city || '',
      
      // Father
      father_lastName: father.lastName || '',
      father_firstName: father.firstName || '',
      father_nationality: 'Française', // Default, can be made configurable
      father_profession: father.profession || '',
      father_employer: '', // Can be added to Parent type if needed
      father_phone: father.phone || '',
      father_mobile: father.phone || '', // Assuming phone is mobile
      father_email: father.email || '',
      
      // Mother
      mother_maidenName: '', // Can be added to Parent type if needed
      mother_marriedName: mother.lastName || '',
      mother_firstName: mother.firstName || '',
      mother_nationality: 'Française', // Default, can be made configurable
      mother_profession: mother.profession || '',
      mother_employer: '', // Can be added to Parent type if needed
      mother_phone: mother.phone || '',
      mother_mobile: mother.phone || '', // Assuming phone is mobile
      mother_email: mother.email || ''
    };
  }
};

// Registry of all templates
export const FORM_TEMPLATES: Record<string, FormTemplate> = {
  periscolaire: PERISCOLAIRE_TEMPLATE,
  edpp: EDPP_TEMPLATE
};

// Helper functions
export function getTemplate(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES[id];
}

export function getAllTemplates(): FormTemplate[] {
  return Object.values(FORM_TEMPLATES);
}

export function getTemplateIds(): string[] {
  return Object.keys(FORM_TEMPLATES);
}
