import { PDFDocument, PDFForm, PDFTextField, rgb } from 'pdf-lib';
import type { Family } from '../../types/forms';

export interface PDFFieldMapping {
  [fieldName: string]: {
    value: string;
    x?: number;
    y?: number;
    fontSize?: number;
    fontColor?: [number, number, number];
  };
}

export class PDFGenerator {
  private pdfDoc: PDFDocument | null = null;
  private form: PDFForm | null = null;

  /**
   * Load a PDF template from the public/templates folder
   */
  async loadTemplate(templateName: string): Promise<void> {
    try {
      // Try different URL encoding approaches
      const attempts = [
        templateName, // Try original name first
        encodeURIComponent(templateName), // Full URL encoding
        templateName.replace(/[–]/g, '-'), // Replace em dash with regular dash
        templateName.replace(/['']/g, '\''), // Replace smart quotes
      ];
      
      for (const attempt of attempts) {
        try {
          const templatePath = `/templates/${attempt}`;
          console.log(`Trying PDF template path: ${templatePath}`);
          
          const response = await fetch(templatePath);
          console.log(`Fetch response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            console.log(`Failed attempt with: ${attempt}`);
            continue;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log(`PDF template loaded, size: ${arrayBuffer.byteLength} bytes`);
          
          // Check if we actually got a PDF by looking at the first few bytes
          const firstBytes = new Uint8Array(arrayBuffer.slice(0, 10));
          const firstBytesStr = Array.from(firstBytes).map(b => String.fromCharCode(b)).join('');
          console.log(`First 10 bytes: ${firstBytesStr}`);
          
          if (!firstBytesStr.startsWith('%PDF-')) {
            console.log(`Invalid PDF file - does not start with PDF header. Got: ${firstBytesStr}`);
            continue;
          }
          
          this.pdfDoc = await PDFDocument.load(arrayBuffer);
          this.form = this.pdfDoc.getForm();
          
          // Get page info
          const pages = this.pdfDoc.getPages();
          console.log(`PDF has ${pages.length} pages`);
          
          // Get form info
          const fields = this.form.getFields();
          console.log(`PDF form has ${fields.length} fields`);
          
          console.log(`PDF template loaded successfully with path: ${templatePath}`);
          return; // Success!
          
        } catch (error) {
          console.log(`Failed to load with attempt: ${attempt}`, error);
        }
      }
      
      throw new Error(`Failed to load PDF template "${templateName}" with any encoding approach`);
      
    } catch (error) {
      console.error('Error loading PDF template:', error);
      throw error;
    }
  }

  /**
   * Get all form fields from the PDF (for debugging/mapping)
   */
  getFormFields(): string[] {
    if (!this.form) {
      throw new Error('No PDF loaded');
    }

    const fields = this.form.getFields();
    return fields.map(field => field.getName());
  }

  /**
   * Fill form fields with data
   */
  fillFormFields(fieldMappings: PDFFieldMapping): void {
    if (!this.form) {
      throw new Error('No PDF loaded');
    }

    Object.entries(fieldMappings).forEach(([fieldName, config]) => {
      try {
        const field = this.form!.getField(fieldName);
        if (field instanceof PDFTextField) {
          field.setText(config.value);
        }
      } catch {
        console.warn(`Field '${fieldName}' not found in PDF form`);
      }
    });
  }

  /**
   * Add text at specific coordinates (for non-form PDFs)
   */
  async addTextAtCoordinates(fieldMappings: PDFFieldMapping): Promise<void> {
    if (!this.pdfDoc) {
      throw new Error('No PDF loaded');
    }

    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(fieldMappings).forEach(([_fieldName, config]) => {
      if (config.x !== undefined && config.y !== undefined) {
        firstPage.drawText(config.value, {
          x: config.x,
          y: config.y,
          size: config.fontSize || 12,
          color: rgb(
            config.fontColor?.[0] || 0,
            config.fontColor?.[1] || 0,
            config.fontColor?.[2] || 0
          ),
        });
      }
    });
  }

  /**
   * Generate the final PDF as a blob
   */
  async generatePDF(): Promise<Blob> {
    if (!this.pdfDoc) {
      throw new Error('No PDF loaded');
    }

    const pdfBytes = await this.pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Download the generated PDF
   */
  async downloadPDF(filename: string): Promise<void> {
    const blob = await this.generatePDF();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

/**
 * Create field mappings from family data for ALSH EDPP form
 */
export function createFieldMappingsFromFamily(family: Family): PDFFieldMapping {
  const address = family.address;
  const mainParent = family.parents?.[0];
  const child = family.students?.[0];
  
  return {
    // Child information fields
    'enfant_nom': { value: child?.lastName || mainParent?.lastName || '' },
    'enfant_prenom': { value: child?.firstName || '' },
    'nom_enfant': { value: child?.lastName || mainParent?.lastName || '' },
    'prenom_enfant': { value: child?.firstName || '' },
    'child_name': { value: child?.firstName || '' },
    'child_lastname': { value: child?.lastName || mainParent?.lastName || '' },
    'date_naissance': { value: child?.birthDate ? new Date(child.birthDate).toLocaleDateString('fr-FR') : '' },
    'birth_date': { value: child?.birthDate ? new Date(child.birthDate).toLocaleDateString('fr-FR') : '' },
    'classe': { value: child?.grade || '' },
    'grade': { value: child?.grade || '' },
    'ecole': { value: child?.school || '' },
    'school': { value: child?.school || '' },
    
    // Address fields - try various possible field names
    'adresse': { value: address.street },
    'address': { value: address.street },
    'rue': { value: address.street },
    'street': { value: address.street },
    'adresse_rue': { value: address.street },
    'adresse_1': { value: address.street },
    
    'ville': { value: address.city },
    'city': { value: address.city },
    'adresse_ville': { value: address.city },
    'adresse_2': { value: address.city },
    
    'code_postal': { value: address.postalCode },
    'postal_code': { value: address.postalCode },
    'cp': { value: address.postalCode },
    'adresse_cp': { value: address.postalCode },
    
    'pays': { value: address.country },
    'country': { value: address.country },
    'adresse_pays': { value: address.country },
    
    // Parent/Responsable legal information
    'responsable_nom': { value: mainParent?.lastName || '' },
    'responsable_prenom': { value: mainParent?.firstName || '' },
    'parent_nom': { value: mainParent?.lastName || '' },
    'parent_prenom': { value: mainParent?.firstName || '' },
    'nom': { value: mainParent?.lastName || '' },
    'prenom': { value: mainParent?.firstName || '' },
    'nom_famille': { value: mainParent?.lastName || '' },
    'lastname': { value: mainParent?.lastName || '' },
    'firstname': { value: mainParent?.firstName || '' },
    
    'civilite': { value: mainParent?.type === 'mother' ? 'Mme' : mainParent?.type === 'father' ? 'M.' : 'M./Mme' },
    'title': { value: mainParent?.type === 'mother' ? 'Mme' : mainParent?.type === 'father' ? 'M.' : 'M./Mme' },
    
    'email': { value: mainParent?.email || '' },
    'mail': { value: mainParent?.email || '' },
    'adresse_email': { value: mainParent?.email || '' },
    'email_parent': { value: mainParent?.email || '' },
    
    'telephone': { value: mainParent?.phone || '' },
    'phone': { value: mainParent?.phone || '' },
    'tel': { value: mainParent?.phone || '' },
    'tel_parent': { value: mainParent?.phone || '' },
    'telephone_parent': { value: mainParent?.phone || '' },
    
    'profession': { value: mainParent?.profession || '' },
    'profession_parent': { value: mainParent?.profession || '' },
    'metier': { value: mainParent?.profession || '' },
    
    'tel_travail': { value: mainParent?.workPhone || '' },
    'telephone_travail': { value: mainParent?.workPhone || '' },
    'work_phone': { value: mainParent?.workPhone || '' },
    
    'employeur': { value: mainParent?.workAddress?.street || '' },
    'lieu_travail': { value: mainParent?.workAddress?.street || '' },
    'work_address': { value: mainParent?.workAddress?.street || '' },
    
    // Emergency contact
    'urgence_nom': { value: family.emergencyContacts?.[0]?.lastName || mainParent?.lastName || '' },
    'urgence_prenom': { value: family.emergencyContacts?.[0]?.firstName || mainParent?.firstName || '' },
    'urgence_telephone': { value: family.emergencyContacts?.[0]?.phone || mainParent?.phone || '' },
    'urgence_lien': { value: family.emergencyContacts?.[0]?.relationship || 'Parent' },
    'contact_urgence': { value: `${family.emergencyContacts?.[0]?.firstName || mainParent?.firstName || ''} ${family.emergencyContacts?.[0]?.lastName || mainParent?.lastName || ''}` },
    
    // Medical information
    'allergies': { value: child?.medicalInfo?.allergies?.join(', ') || '' },
    'medicaments': { value: child?.medicalInfo?.medications?.join(', ') || '' },
    'conditions_medicales': { value: child?.medicalInfo?.conditions?.join(', ') || '' },
    'notes_medicales': { value: child?.medicalInfo?.notes || '' },
    'besoins_speciaux': { value: child?.specialNeeds || '' },
    
    // Authorization fields
    'autorisation_photo': { value: child?.photoAuthorization ? 'Oui' : 'Non' },
    'autorisation_transport': { value: child?.transportAuthorization ? 'Oui' : 'Non' },
    
    // Date and signature
    'date': { value: new Date().toLocaleDateString('fr-FR') },
    'date_signature': { value: new Date().toLocaleDateString('fr-FR') },
    'lieu_signature': { value: address.city },
    
    // Institution information
    'etablissement': { value: 'ALSH - EDPP' },
    'annee_scolaire': { value: '2025-2026' },
    
    // Full address field
    'adresse_complete': {
      value: `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`,
    },
  };
}

/**
 * Create coordinate-based mappings for ALSH EDPP 2025-2026 form
 * These coordinates are calibrated to match the actual PDF form fields
 * PDF coordinates: (0,0) is bottom-left corner, Y increases upward
 * Coordinates analyzed from the actual form layout
 */
export function createCoordinateMappingsFromFamily(family: Family): PDFFieldMapping {
  const address = family.address;
  const mainParent = family.parents?.[0];
  const child = family.students?.[0];
  
  return {
    // SECTION 1: INFORMATIONS ENFANT (Child Information) - Top section
    'enfant_nom': {
      value: child?.lastName || mainParent?.lastName || '',
      x: 235,
      y: 765, // NOM field in the top section
      fontSize: 10,
    },
    'enfant_prenom': {
      value: child?.firstName || '',
      x: 425,
      y: 765, // PRENOM field in the top section
      fontSize: 10,
    },
    'enfant_date_naissance': {
      value: child?.birthDate ? new Date(child.birthDate).toLocaleDateString('fr-FR') : '',
      x: 175,
      y: 740, // Né(e) le ... field
      fontSize: 10,
    },
    'enfant_nationalite': {
      value: 'Française',
      x: 505,
      y: 740, // Nationalité field
      fontSize: 10,
    },

    // SECTION 2: ADRESSE - in the "Renseignement d'état civil" section
    'adresse_rue': {
      value: address.street,
      x: 115,
      y: 700, // ADRESSE field
      fontSize: 9,
    },
    'adresse_code_postal': {
      value: address.postalCode,
      x: 145,
      y: 680, // Code postal field
      fontSize: 10,
    },
    'adresse_ville': {
      value: address.city,
      x: 355,
      y: 680, // Ville field
      fontSize: 10,
    },

    // SECTION 3: PÈRE (Father section) - around y=580-500
    'pere_nom': {
      value: mainParent?.type === 'father' ? mainParent?.lastName || '' : '',
      x: 235,
      y: 580, // Nom du père field
      fontSize: 10,
    },
    'pere_prenom': {
      value: mainParent?.type === 'father' ? mainParent?.firstName || '' : '',
      x: 425,
      y: 580, // Prénom du père field  
      fontSize: 10,
    },
    'pere_adresse': {
      value: mainParent?.type === 'father' ? address.street : '',
      x: 115,
      y: 555, // ADRESSE du père
      fontSize: 9,
    },
    'pere_profession': {
      value: mainParent?.type === 'father' ? mainParent?.profession || '' : '',
      x: 165,
      y: 530, // Profession du père
      fontSize: 9,
    },
    'pere_employeur': {
      value: mainParent?.type === 'father' ? mainParent?.workAddress?.street || '' : '',
      x: 405,
      y: 530, // Employeur du père
      fontSize: 9,
    },
    'pere_mobile': {
      value: mainParent?.type === 'father' ? mainParent?.phone || '' : '',
      x: 165,
      y: 510, // Mobile du père
      fontSize: 9,
    },
    'pere_mail': {
      value: mainParent?.type === 'father' ? mainParent?.email || '' : '',
      x: 355,
      y: 510, // Mail du père
      fontSize: 9,
    },

    // SECTION 4: MÈRE (Mother section) - around y=450-380
    'mere_nom_jeune_fille': {
      value: mainParent?.type === 'mother' ? mainParent?.lastName || '' : '',
      x: 355,
      y: 455, // Nom de jeune fille de la mère
      fontSize: 10,
    },
    'mere_nom_marital': {
      value: mainParent?.type === 'mother' ? mainParent?.lastName || '' : '',
      x: 505,
      y: 455, // Nom marital
      fontSize: 10,
    },
    'mere_prenom': {
      value: mainParent?.type === 'mother' ? mainParent?.firstName || '' : '',
      x: 205,
      y: 435, // Prénom de la mère
      fontSize: 10,
    },
    'mere_nationalite': {
      value: mainParent?.type === 'mother' ? 'Française' : '',
      x: 425,
      y: 435, // Nationalité de la mère
      fontSize: 10,
    },
    'mere_adresse': {
      value: mainParent?.type === 'mother' ? address.street : '',
      x: 115,
      y: 410, // ADRESSE de la mère
      fontSize: 9,
    },
    'mere_profession': {
      value: mainParent?.type === 'mother' ? mainParent?.profession || '' : '',
      x: 165,
      y: 385, // Profession de la mère
      fontSize: 9,
    },
    'mere_employeur': {
      value: mainParent?.type === 'mother' ? mainParent?.workAddress?.street || '' : '',
      x: 405,
      y: 385, // Employeur de la mère
      fontSize: 9,
    },
    'mere_mobile': {
      value: mainParent?.type === 'mother' ? mainParent?.phone || '' : '',
      x: 165,
      y: 365, // Mobile de la mère
      fontSize: 9,
    },
    'mere_mail': {
      value: mainParent?.type === 'mother' ? mainParent?.email || '' : '',
      x: 355,
      y: 365, // Mail de la mère
      fontSize: 9,
    },

    // Generic mappings for easier access
    'nom': {
      value: mainParent?.lastName || '',
      x: mainParent?.type === 'father' ? 235 : 355,
      y: mainParent?.type === 'father' ? 580 : 455,
      fontSize: 10,
    },
    'prenom': {
      value: mainParent?.firstName || '',
      x: mainParent?.type === 'father' ? 425 : 205,
      y: mainParent?.type === 'father' ? 580 : 435,
      fontSize: 10,
    },
    'email': {
      value: mainParent?.email || '',
      x: 355,
      y: mainParent?.type === 'father' ? 510 : 365,
      fontSize: 9,
    },
    'telephone': {
      value: mainParent?.phone || '',
      x: 165,
      y: mainParent?.type === 'father' ? 510 : 365,
      fontSize: 9,
    },

    // Alternative field names for backward compatibility
    'child_name': {
      value: child?.firstName || '',
      x: 425,
      y: 765,
      fontSize: 10,
    },
    'nom_enfant': {
      value: child?.lastName || mainParent?.lastName || '',
      x: 235,
      y: 765,
      fontSize: 10,
    },
    'adresse': {
      value: address.street,
      x: 115,
      y: 700,
      fontSize: 9,
    },
    'ville': {
      value: address.city,
      x: 355,
      y: 680,
      fontSize: 10,
    },
    'code_postal': {
      value: address.postalCode,
      x: 145,
      y: 680,
      fontSize: 10,
    },
  };
}
