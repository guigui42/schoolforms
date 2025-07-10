import type { Family } from '../../types/forms';

/**
 * PDF Template Configuration System
 * Each template defines field mappings and coordinates for a specific PDF form
 */

export interface PDFFieldCoordinate {
  x: number;
  y: number;
  fontSize?: number;
  fontColor?: [number, number, number];
  fontFamily?: string;
  maxWidth?: number;
}

export interface PDFFieldMapping {
  value: string;
  coordinate: PDFFieldCoordinate;
}

export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  description: string;
  fields: Record<string, PDFFieldCoordinate>;
  getFieldMappings: (family: Family) => Record<string, PDFFieldMapping>;
}

/**
 * ALSH EDPP 2025-2026 Template Configuration
 * Coordinates are calibrated for the "Dossier d'inscription ALSH - EDPP 2025-2026.pdf"
 */
export const ALSH_EDPP_TEMPLATE: PDFTemplate = {
  id: 'alsh-edpp-2025-2026',
  name: 'ALSH EDPP 2025-2026',
  fileName: 'Dossier d\'inscription ALSH - EDPP 2025-2026.pdf',
  description: 'Dossier d\'inscription pour ALSH EDPP année scolaire 2025-2026',
  
  fields: {
    // SECTION 1: Child Information (Top section)
    'child.lastName': { x: 235, y: 765, fontSize: 10 },
    'child.firstName': { x: 425, y: 765, fontSize: 10 },
    'child.birthDate': { x: 175, y: 740, fontSize: 10 },
    'child.nationality': { x: 505, y: 740, fontSize: 10 },
    'child.grade': { x: 140, y: 600, fontSize: 10 },
    'child.school': { x: 300, y: 600, fontSize: 10 },

    // SECTION 2: Address Information
    'address.street': { x: 115, y: 700, fontSize: 9 },
    'address.postalCode': { x: 145, y: 680, fontSize: 10 },
    'address.city': { x: 355, y: 680, fontSize: 10 },
    'address.country': { x: 500, y: 680, fontSize: 10 },

    // SECTION 3: Father Information (PÈRE)
    'father.lastName': { x: 235, y: 580, fontSize: 10 },
    'father.firstName': { x: 425, y: 580, fontSize: 10 },
    'father.nationality': { x: 190, y: 555, fontSize: 10 },
    'father.address': { x: 115, y: 555, fontSize: 9 },
    'father.profession': { x: 165, y: 530, fontSize: 9 },
    'father.employer': { x: 405, y: 530, fontSize: 9 },
    'father.mobile': { x: 165, y: 510, fontSize: 9 },
    'father.email': { x: 355, y: 510, fontSize: 9 },

    // SECTION 4: Mother Information (MÈRE)
    'mother.maidenName': { x: 355, y: 455, fontSize: 10 },
    'mother.marriedName': { x: 505, y: 455, fontSize: 10 },
    'mother.firstName': { x: 205, y: 435, fontSize: 10 },
    'mother.nationality': { x: 425, y: 435, fontSize: 10 },
    'mother.address': { x: 115, y: 410, fontSize: 9 },
    'mother.profession': { x: 165, y: 385, fontSize: 9 },
    'mother.employer': { x: 405, y: 385, fontSize: 9 },
    'mother.mobile': { x: 165, y: 365, fontSize: 9 },
    'mother.email': { x: 355, y: 365, fontSize: 9 },

    // SECTION 5: Emergency Contact Information
    'emergency.lastName': { x: 200, y: 320, fontSize: 9 },
    'emergency.firstName': { x: 350, y: 320, fontSize: 9 },
    'emergency.phone': { x: 450, y: 320, fontSize: 9 },
    'emergency.relationship': { x: 200, y: 300, fontSize: 9 },

    // SECTION 6: Medical Information
    'medical.allergies': { x: 150, y: 260, fontSize: 8 },
    'medical.medications': { x: 150, y: 240, fontSize: 8 },
    'medical.conditions': { x: 150, y: 220, fontSize: 8 },
    'medical.notes': { x: 150, y: 200, fontSize: 8 },

    // SECTION 7: Administrative
    'admin.date': { x: 400, y: 100, fontSize: 10 },
    'admin.place': { x: 300, y: 100, fontSize: 10 },
    'admin.year': { x: 450, y: 780, fontSize: 12 },
    'admin.institution': { x: 300, y: 780, fontSize: 12 },
  },

  getFieldMappings: (family: Family) => {
    const address = family.address;
    const mainParent = family.parents?.[0];
    const child = family.students?.[0];
    const emergency = family.emergencyContacts?.[0];

    const mappings: Record<string, PDFFieldMapping> = {};
    const template = ALSH_EDPP_TEMPLATE;

    // Child Information
    if (child) {
      mappings['child.lastName'] = {
        value: child.lastName || mainParent?.lastName || '',
        coordinate: template.fields['child.lastName']
      };
      mappings['child.firstName'] = {
        value: child.firstName || '',
        coordinate: template.fields['child.firstName']
      };
      mappings['child.birthDate'] = {
        value: child.birthDate ? new Date(child.birthDate).toLocaleDateString('fr-FR') : '',
        coordinate: template.fields['child.birthDate']
      };
      mappings['child.nationality'] = {
        value: 'Française',
        coordinate: template.fields['child.nationality']
      };
      mappings['child.grade'] = {
        value: child.grade || '',
        coordinate: template.fields['child.grade']
      };
      mappings['child.school'] = {
        value: child.school || '',
        coordinate: template.fields['child.school']
      };
    }

    // Address Information
    mappings['address.street'] = {
      value: address.street,
      coordinate: template.fields['address.street']
    };
    mappings['address.postalCode'] = {
      value: address.postalCode,
      coordinate: template.fields['address.postalCode']
    };
    mappings['address.city'] = {
      value: address.city,
      coordinate: template.fields['address.city']
    };
    mappings['address.country'] = {
      value: address.country,
      coordinate: template.fields['address.country']
    };

    // Parent Information (dynamically assign to father or mother section)
    if (mainParent) {
      if (mainParent.type === 'father') {
        mappings['father.lastName'] = {
          value: mainParent.lastName || '',
          coordinate: template.fields['father.lastName']
        };
        mappings['father.firstName'] = {
          value: mainParent.firstName || '',
          coordinate: template.fields['father.firstName']
        };
        mappings['father.nationality'] = {
          value: 'Française',
          coordinate: template.fields['father.nationality']
        };
        mappings['father.address'] = {
          value: address.street,
          coordinate: template.fields['father.address']
        };
        mappings['father.profession'] = {
          value: mainParent.profession || '',
          coordinate: template.fields['father.profession']
        };
        mappings['father.employer'] = {
          value: mainParent.workAddress?.street || '',
          coordinate: template.fields['father.employer']
        };
        mappings['father.mobile'] = {
          value: mainParent.phone || '',
          coordinate: template.fields['father.mobile']
        };
        mappings['father.email'] = {
          value: mainParent.email || '',
          coordinate: template.fields['father.email']
        };
      } else if (mainParent.type === 'mother') {
        mappings['mother.maidenName'] = {
          value: mainParent.lastName || '',
          coordinate: template.fields['mother.maidenName']
        };
        mappings['mother.marriedName'] = {
          value: mainParent.lastName || '',
          coordinate: template.fields['mother.marriedName']
        };
        mappings['mother.firstName'] = {
          value: mainParent.firstName || '',
          coordinate: template.fields['mother.firstName']
        };
        mappings['mother.nationality'] = {
          value: 'Française',
          coordinate: template.fields['mother.nationality']
        };
        mappings['mother.address'] = {
          value: address.street,
          coordinate: template.fields['mother.address']
        };
        mappings['mother.profession'] = {
          value: mainParent.profession || '',
          coordinate: template.fields['mother.profession']
        };
        mappings['mother.employer'] = {
          value: mainParent.workAddress?.street || '',
          coordinate: template.fields['mother.employer']
        };
        mappings['mother.mobile'] = {
          value: mainParent.phone || '',
          coordinate: template.fields['mother.mobile']
        };
        mappings['mother.email'] = {
          value: mainParent.email || '',
          coordinate: template.fields['mother.email']
        };
      }
    }

    // Emergency Contact Information
    if (emergency) {
      mappings['emergency.lastName'] = {
        value: emergency.lastName || mainParent?.lastName || '',
        coordinate: template.fields['emergency.lastName']
      };
      mappings['emergency.firstName'] = {
        value: emergency.firstName || mainParent?.firstName || '',
        coordinate: template.fields['emergency.firstName']
      };
      mappings['emergency.phone'] = {
        value: emergency.phone || mainParent?.phone || '',
        coordinate: template.fields['emergency.phone']
      };
      mappings['emergency.relationship'] = {
        value: emergency.relationship || 'Parent',
        coordinate: template.fields['emergency.relationship']
      };
    }

    // Medical Information
    if (child?.medicalInfo) {
      mappings['medical.allergies'] = {
        value: child.medicalInfo.allergies?.join(', ') || '',
        coordinate: template.fields['medical.allergies']
      };
      mappings['medical.medications'] = {
        value: child.medicalInfo.medications?.join(', ') || '',
        coordinate: template.fields['medical.medications']
      };
      mappings['medical.conditions'] = {
        value: child.medicalInfo.conditions?.join(', ') || '',
        coordinate: template.fields['medical.conditions']
      };
      mappings['medical.notes'] = {
        value: child.medicalInfo.notes || '',
        coordinate: template.fields['medical.notes']
      };
    }

    // Administrative Information
    mappings['admin.date'] = {
      value: new Date().toLocaleDateString('fr-FR'),
      coordinate: template.fields['admin.date']
    };
    mappings['admin.place'] = {
      value: address.city,
      coordinate: template.fields['admin.place']
    };
    mappings['admin.year'] = {
      value: '2025-2026',
      coordinate: template.fields['admin.year']
    };
    mappings['admin.institution'] = {
      value: 'ALSH - EDPP',
      coordinate: template.fields['admin.institution']
    };

    return mappings;
  }
};

/**
 * PERISCOLAIRE Template Configuration
 * Coordinates for the "PERISCOLAIRE – 2025-2026 - Fiche d'inscription.pdf"
 */
export const PERISCOLAIRE_TEMPLATE: PDFTemplate = {
  id: 'periscolaire-2025-2026',
  name: 'Périscolaire 2025-2026',
  fileName: 'PERISCOLAIRE – 2025-2026 - Fiche d\'inscription (1).pdf',
  description: 'Fiche d\'inscription périscolaire année scolaire 2025-2026',
  
  fields: {
    // TODO: Add coordinates for PERISCOLAIRE form
    // These need to be calibrated based on the actual PDF
    'child.lastName': { x: 200, y: 750, fontSize: 10 },
    'child.firstName': { x: 400, y: 750, fontSize: 10 },
    'child.birthDate': { x: 150, y: 720, fontSize: 10 },
    'address.street': { x: 120, y: 680, fontSize: 9 },
    'address.city': { x: 350, y: 680, fontSize: 10 },
    'address.postalCode': { x: 150, y: 660, fontSize: 10 },
    'parent.lastName': { x: 200, y: 600, fontSize: 10 },
    'parent.firstName': { x: 400, y: 600, fontSize: 10 },
    'parent.phone': { x: 150, y: 580, fontSize: 9 },
    'parent.email': { x: 350, y: 580, fontSize: 9 },
  },

  getFieldMappings: (family: Family) => {
    // TODO: Implement field mappings for PERISCOLAIRE form
    // Similar to ALSH_EDPP_TEMPLATE implementation
    const mappings: Record<string, PDFFieldMapping> = {};
    
    // Example usage (commented out until implemented):
    // const child = family.students?.[0];
    // const mainParent = family.parents?.[0];
    // const address = family.address;
    
    // For now, use family parameter to avoid lint error
    console.log('PERISCOLAIRE template - family data available:', !!family);
    
    return mappings;
  }
};

/**
 * EDPP Contract Template Configuration
 * Coordinates for the "EDPP Contrat d'engagement 2025-2026.pdf"
 */
export const EDPP_CONTRACT_TEMPLATE: PDFTemplate = {
  id: 'edpp-contract-2025-2026',
  name: 'EDPP Contrat d\'engagement 2025-2026',
  fileName: 'EDPP Contrat d\'engagement 2025-2026.pdf',
  description: 'Contrat d\'engagement EDPP année scolaire 2025-2026',
  
  fields: {
    // TODO: Add coordinates for EDPP Contract form
    'child.lastName': { x: 180, y: 720, fontSize: 10 },
    'child.firstName': { x: 380, y: 720, fontSize: 10 },
    'parent.lastName': { x: 180, y: 650, fontSize: 10 },
    'parent.firstName': { x: 380, y: 650, fontSize: 10 },
    'parent.signature': { x: 400, y: 150, fontSize: 10 },
    'admin.date': { x: 200, y: 150, fontSize: 10 },
  },

  getFieldMappings: (family: Family) => {
    // TODO: Implement field mappings for EDPP Contract form
    // Similar to ALSH_EDPP_TEMPLATE implementation
    const mappings: Record<string, PDFFieldMapping> = {};
    
    // Example usage (commented out until implemented):
    // const child = family.students?.[0];
    // const mainParent = family.parents?.[0];
    // const address = family.address;
    
    // For now, use family parameter to avoid lint error
    console.log('EDPP Contract template - family data available:', !!family);
    
    return mappings;
  }
};

/**
 * EDPP Wednesday & Holidays Template Configuration
 * Coordinates for the "Fiche d'inscription EDPP - Mercredis Vacs sco 25-26.pdf"
 */
export const EDPP_WEDNESDAY_TEMPLATE: PDFTemplate = {
  id: 'edpp-wednesday-2025-2026',
  name: 'EDPP Mercredis & Vacances 2025-2026',
  fileName: 'Fiche d\'inscription EDPP - Mercredis Vacs sco 25-26.pdf',
  description: 'Fiche d\'inscription EDPP pour les mercredis et vacances scolaires 2025-2026',
  
  fields: {
    // TODO: Add coordinates for EDPP Wednesday form
    'child.lastName': { x: 220, y: 740, fontSize: 10 },
    'child.firstName': { x: 420, y: 740, fontSize: 10 },
    'child.grade': { x: 150, y: 710, fontSize: 10 },
    'address.street': { x: 130, y: 670, fontSize: 9 },
    'address.city': { x: 360, y: 670, fontSize: 10 },
    'parent.lastName': { x: 220, y: 610, fontSize: 10 },
    'parent.firstName': { x: 420, y: 610, fontSize: 10 },
    'parent.phone': { x: 160, y: 590, fontSize: 9 },
    'parent.email': { x: 360, y: 590, fontSize: 9 },
  },

  getFieldMappings: (family: Family) => {
    // TODO: Implement field mappings for EDPP Wednesday form
    // Similar to ALSH_EDPP_TEMPLATE implementation
    const mappings: Record<string, PDFFieldMapping> = {};
    
    // Example usage (commented out until implemented):
    // const child = family.students?.[0];
    // const mainParent = family.parents?.[0];
    // const address = family.address;
    
    // For now, use family parameter to avoid lint error
    console.log('EDPP Wednesday template - family data available:', !!family);
    
    return mappings;
  }
};

/**
 * Template Registry
 * Central registry of all available PDF templates
 */
export const PDF_TEMPLATES: Record<string, PDFTemplate> = {
  [ALSH_EDPP_TEMPLATE.id]: ALSH_EDPP_TEMPLATE,
  [PERISCOLAIRE_TEMPLATE.id]: PERISCOLAIRE_TEMPLATE,
  [EDPP_CONTRACT_TEMPLATE.id]: EDPP_CONTRACT_TEMPLATE,
  [EDPP_WEDNESDAY_TEMPLATE.id]: EDPP_WEDNESDAY_TEMPLATE,
};

/**
 * Helper function to get a template by ID
 */
export function getTemplate(templateId: string): PDFTemplate | undefined {
  return PDF_TEMPLATES[templateId];
}

/**
 * Helper function to get template by filename
 */
export function getTemplateByFilename(filename: string): PDFTemplate | undefined {
  return Object.values(PDF_TEMPLATES).find(template => template.fileName === filename);
}

/**
 * Helper function to list all available templates
 */
export function getAllTemplates(): PDFTemplate[] {
  return Object.values(PDF_TEMPLATES);
}

/**
 * Helper function to generate field mappings for a specific template
 */
export function generateFieldMappingsForTemplate(templateId: string, family: Family): Record<string, PDFFieldMapping> | undefined {
  const template = getTemplate(templateId);
  if (!template) {
    return undefined;
  }
  return template.getFieldMappings(family);
}
