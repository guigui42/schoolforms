/**
 * PDF Template Field Mappings
 * 
 * This file contains the mappings between our application data fields
 * and the actual form field names in the PDF templates.
 * 
 * To add a new template:
 * 1. Add the PDF file to public/templates/
 * 2. Add the template configuration below
 * 3. Define the field mappings
 */

import type { Family } from '../../types/forms';

export interface PDFFieldMapping {
  /** The PDF form field name */
  pdfFieldName: string;
  /** The type of form field in the PDF */
  fieldType: 'text' | 'checkbox' | 'radio' | 'dropdown';
  /** Function to extract the value from family data */
  getValue: (data: Family) => string | boolean | number;
  /** Whether this field is required */
  required?: boolean;
  /** Default value if no data available */
  defaultValue?: string | boolean | number;
}

export interface TemplateConfig {
  /** Template ID for reference */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Path to the PDF template file */
  templatePath: string;
  /** Field mappings for this template */
  fields: PDFFieldMapping[];
}

// =============================================================================
// FIELD EXTRACTORS
// Helper functions to extract data from family objects
// =============================================================================

const extractors = {
  // Student data extractors
  studentFullName: (data: Family) => {
    const student = data.students?.[0];
    return student ? `${student.firstName} ${student.lastName}`.trim() : '';
  },
  
  studentFirstName: (data: Family) => data.students?.[0]?.firstName || '',
  studentLastName: (data: Family) => data.students?.[0]?.lastName || '',
  studentBirthDate: (data: Family) => {
    const birthDate = data.students?.[0]?.birthDate;
    if (!birthDate) return '';
    try {
      return new Date(birthDate).toLocaleDateString('fr-FR');
    } catch {
      return '';
    }
  },
  studentGrade: (data: Family) => data.students?.[0]?.grade || '',
  studentSchool: (data: Family) => data.students?.[0]?.school || '',
  
  // Gender extractors (for checkboxes)
  studentIsMale: (_data: Family) => {
    // You can implement gender logic based on your data model
    // For now, defaulting to true for testing
    return true;
  },
  studentIsFemale: (_data: Family) => {
    // You can implement gender logic based on your data model
    // For now, defaulting to false for testing
    return false;
  },
  
  // Address extractors
  addressStreet: (data: Family) => data.address?.street || '',
  addressCity: (data: Family) => data.address?.city || '',
  addressPostalCode: (data: Family) => data.address?.postalCode || '',
  addressFull: (data: Family) => {
    const addr = data.address;
    if (!addr) return '';
    return `${addr.street}, ${addr.postalCode} ${addr.city}`.trim();
  },
  
  // Parent extractors
  fatherFirstName: (data: Family) => {
    const father = data.parents?.find(p => p.type === 'father');
    return father?.firstName || '';
  },
  fatherLastName: (data: Family) => {
    const father = data.parents?.find(p => p.type === 'father');
    return father?.lastName || '';
  },
  fatherEmail: (data: Family) => {
    const father = data.parents?.find(p => p.type === 'father');
    return father?.email || '';
  },
  fatherPhone: (data: Family) => {
    const father = data.parents?.find(p => p.type === 'father');
    return father?.phone || '';
  },
  fatherProfession: (data: Family) => {
    const father = data.parents?.find(p => p.type === 'father');
    return father?.profession || '';
  },
  
  motherFirstName: (data: Family) => {
    const mother = data.parents?.find(p => p.type === 'mother');
    return mother?.firstName || '';
  },
  motherLastName: (data: Family) => {
    const mother = data.parents?.find(p => p.type === 'mother');
    return mother?.lastName || '';
  },
  motherEmail: (data: Family) => {
    const mother = data.parents?.find(p => p.type === 'mother');
    return mother?.email || '';
  },
  motherPhone: (data: Family) => {
    const mother = data.parents?.find(p => p.type === 'mother');
    return mother?.phone || '';
  },
  motherProfession: (data: Family) => {
    const mother = data.parents?.find(p => p.type === 'mother');
    return mother?.profession || '';
  },
  
  // Emergency contact extractors
  emergencyContactName: (data: Family) => {
    const emergency = data.emergencyContacts?.[0];
    return emergency ? `${emergency.firstName} ${emergency.lastName}`.trim() : '';
  },
  emergencyContactPhone: (data: Family) => data.emergencyContacts?.[0]?.phone || '',
  emergencyContactRelationship: (data: Family) => data.emergencyContacts?.[0]?.relationship || '',
  
  // Static values for testing
  defaultNationality: () => 'Française',
  currentDate: () => new Date().toLocaleDateString('fr-FR'),
};

// =============================================================================
// TEMPLATE CONFIGURATIONS
// =============================================================================

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  // Test templates for development
  'test-periscolaire': {
    id: 'test-periscolaire',
    name: 'Périscolaire (Test)',
    description: 'Formulaire d\'inscription périscolaire - Version test',
    templatePath: '/templates/test-periscolaire.pdf',
    fields: [
      {
        pdfFieldName: 'test.name',
        fieldType: 'text',
        getValue: extractors.studentFullName,
        required: true
      },
      {
        pdfFieldName: 'test.homme',
        fieldType: 'checkbox',
        getValue: extractors.studentIsMale
      },
      {
        pdfFieldName: 'test.femme',
        fieldType: 'checkbox',
        getValue: extractors.studentIsFemale
      }
    ]
  },
  
  'test-edpp': {
    id: 'test-edpp',
    name: 'EDPP (Test)',
    description: 'Dossier d\'inscription ALSH - EDPP - Version test',
    templatePath: '/templates/test-edpp.pdf',
    fields: [
      {
        pdfFieldName: 'test.name',
        fieldType: 'text',
        getValue: extractors.studentFullName,
        required: true
      },
      {
        pdfFieldName: 'test.homme',
        fieldType: 'checkbox',
        getValue: extractors.studentIsMale
      },
      {
        pdfFieldName: 'test.femme',
        fieldType: 'checkbox',
        getValue: extractors.studentIsFemale
      }
    ]
  },
  
  // Production templates (to be configured when you add real form fields)
  'periscolaire': {
    id: 'periscolaire',
    name: 'Périscolaire',
    description: 'Formulaire d\'inscription périscolaire',
    templatePath: '/templates/PERISCOLAIRE-2025-2026-Fiche-inscription.pdf', // Rename your file to this
    fields: [
      // TODO: Add real field mappings when you add form fields to the PDF
      // Example structure:
      // {
      //   pdfFieldName: 'child.firstName',
      //   fieldType: 'text',
      //   getValue: extractors.studentFirstName,
      //   required: true
      // },
      // {
      //   pdfFieldName: 'child.lastName', 
      //   fieldType: 'text',
      //   getValue: extractors.studentLastName,
      //   required: true
      // },
      // {
      //   pdfFieldName: 'child.birthDate',
      //   fieldType: 'text',
      //   getValue: extractors.studentBirthDate,
      //   required: true
      // },
      // {
      //   pdfFieldName: 'address.street',
      //   fieldType: 'text',
      //   getValue: extractors.addressStreet
      // },
      // {
      //   pdfFieldName: 'father.firstName',
      //   fieldType: 'text',
      //   getValue: extractors.fatherFirstName
      // },
      // {
      //   pdfFieldName: 'mother.firstName',
      //   fieldType: 'text',
      //   getValue: extractors.motherFirstName
      // }
    ]
  },
  
  'edpp': {
    id: 'edpp',
    name: 'EDPP',
    description: 'Dossier d\'inscription ALSH - EDPP',
    templatePath: '/templates/Dossier-inscription-ALSH-EDPP-2025-2026.pdf', // Rename your file to this
    fields: [
      // TODO: Add real field mappings when you add form fields to the PDF
    ]
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get template configuration by ID
 */
export function getTemplateConfig(templateId: string): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS[templateId];
}

/**
 * Get all available template configurations
 */
export function getAllTemplateConfigs(): TemplateConfig[] {
  return Object.values(TEMPLATE_CONFIGS);
}

/**
 * Get template IDs
 */
export function getTemplateIds(): string[] {
  return Object.keys(TEMPLATE_CONFIGS);
}

/**
 * Get production-ready templates (excludes test templates)
 */
export function getProductionTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATE_CONFIGS).filter(config => !config.id.startsWith('test-'));
}

/**
 * Get test templates only
 */
export function getTestTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATE_CONFIGS).filter(config => config.id.startsWith('test-'));
}

/**
 * Extract data for a specific template from family data
 */
export function extractTemplateData(templateId: string, familyData: Family): Record<string, string | boolean | number> {
  const config = getTemplateConfig(templateId);
  if (!config) {
    throw new Error(`Template configuration not found: ${templateId}`);
  }
  
  const extractedData: Record<string, string | boolean | number> = {};
  
  for (const field of config.fields) {
    try {
      const value = field.getValue(familyData);
      extractedData[field.pdfFieldName] = value !== undefined ? value : (field.defaultValue || '');
    } catch (error) {
      console.warn(`Error extracting field ${field.pdfFieldName}:`, error);
      extractedData[field.pdfFieldName] = field.defaultValue || '';
    }
  }
  
  return extractedData;
}
