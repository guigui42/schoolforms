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
    // SECTION 1: Child Information (Calibrated based on visual feedback)
    'child.lastName': { x: 270, y: 540, fontSize: 10 },           // "NOM" field
    'child.firstName': { x: 430, y: 540, fontSize: 10 },          // "PRENOM" field  
    'child.birthDate': { x: 270, y: 515, fontSize: 10 },          // "Né(e) le" field
    'child.nationality': { x: 500, y: 515, fontSize: 10 },        // "Nationalité" field
    'child.grade': { x: 270, y: 760, fontSize: 10 },              // "Classe" field (top)
    'child.school': { x: 400, y: 760, fontSize: 10 },             // "Année" field (top)

    // SECTION 2: Address Information (Calibrated)
    'address.street': { x: 170, y: 490, fontSize: 9 },            // "ADRESSE" field
    'address.postalCode': { x: 270, y: 465, fontSize: 10 },       // "Code postal" field
    'address.city': { x: 400, y: 465, fontSize: 10 },             // "Ville" field
    'address.country': { x: 500, y: 465, fontSize: 10 },          // Country field

    // SECTION 3: Father Information (Calibrated)
    'father.lastName': { x: 270, y: 380, fontSize: 10 },          // "Nom du père" field
    'father.firstName': { x: 430, y: 380, fontSize: 10 },         // "Prénom" field
    'father.nationality': { x: 200, y: 355, fontSize: 10 },       // "Nationalité" field
    'father.address': { x: 200, y: 330, fontSize: 9 },            // "ADRESSE" field
    'father.profession': { x: 200, y: 305, fontSize: 9 },         // "Profession" field
    'father.employer': { x: 400, y: 305, fontSize: 9 },           // "Employeur" field
    'father.mobile': { x: 200, y: 280, fontSize: 9 },             // "Mobile" field
    'father.email': { x: 370, y: 280, fontSize: 9 },              // "Mail" field

    // SECTION 4: Mother Information (Calibrated)
    'mother.maidenName': { x: 430, y: 190, fontSize: 10 },        // "Nom de jeune fille" field
    'mother.marriedName': { x: 500, y: 190, fontSize: 10 },       // "Nom marital" field
    'mother.firstName': { x: 270, y: 165, fontSize: 10 },         // "Prénom" field
    'mother.nationality': { x: 400, y: 165, fontSize: 10 },       // "Nationalité" field
    'mother.address': { x: 200, y: 140, fontSize: 9 },            // "ADRESSE" field
    'mother.profession': { x: 200, y: 115, fontSize: 9 },         // "Profession" field
    'mother.employer': { x: 400, y: 115, fontSize: 9 },           // "Employeur" field
    'mother.mobile': { x: 200, y: 90, fontSize: 9 },              // "Mobile" field
    'mother.email': { x: 370, y: 90, fontSize: 9 },               // "Mail" field

    // SECTION 5: Emergency Contact Information (Estimated positioning)
    'emergency.lastName': { x: 200, y: 200, fontSize: 9 },
    'emergency.firstName': { x: 350, y: 200, fontSize: 9 },
    'emergency.phone': { x: 200, y: 180, fontSize: 9 },
    'emergency.relationship': { x: 400, y: 180, fontSize: 9 },

    // SECTION 6: Medical Information (Estimated positioning)
    'medical.allergies': { x: 200, y: 150, fontSize: 8 },
    'medical.medications': { x: 200, y: 130, fontSize: 8 },
    'medical.conditions': { x: 200, y: 110, fontSize: 8 },
    'medical.notes': { x: 200, y: 90, fontSize: 8 },

    // SECTION 7: Administrative (Calibrated)
    'admin.date': { x: 400, y: 50, fontSize: 10 },                // Date field
    'admin.place': { x: 200, y: 50, fontSize: 10 },               // Place field
    'admin.year': { x: 400, y: 760, fontSize: 12 },               // Year field (top)
    'admin.institution': { x: 200, y: 800, fontSize: 12 },        // Institution header
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
