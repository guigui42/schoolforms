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
 * These coordinates are based on the actual PDF form structure
 * PDF coordinates: (0,0) is bottom-left corner, Y increases upward
 */
export function createCoordinateMappingsFromFamily(family: Family): PDFFieldMapping {
  const address = family.address;
  const mainParent = family.parents?.[0];
  const child = family.students?.[0];
  
  return {
    // SECTION 1: INFORMATIONS ENFANT (Child Information)
    'enfant_nom': {
      value: child?.lastName || mainParent?.lastName || '',
      x: 150,
      y: 720, // Top section - child last name
      fontSize: 10,
    },
    'enfant_prenom': {
      value: child?.firstName || '',
      x: 350,
      y: 720, // Top section - child first name
      fontSize: 10,
    },
    'enfant_date_naissance': {
      value: child?.birthDate ? new Date(child.birthDate).toLocaleDateString('fr-FR') : '',
      x: 450,
      y: 720, // Birth date
      fontSize: 10,
    },
    'enfant_sexe': {
      value: '', // Gender not in schema, leave empty
      x: 150,
      y: 700, // Gender field
      fontSize: 10,
    },
    'enfant_classe': {
      value: child?.grade || '',
      x: 250,
      y: 700, // School grade/class
      fontSize: 10,
    },
    'enfant_ecole': {
      value: child?.school || '',
      x: 350,
      y: 700, // School name
      fontSize: 10,
    },

    // SECTION 2: ADRESSE FAMILIALE (Family Address)
    'adresse_rue': {
      value: address.street,
      x: 150,
      y: 650, // Street address
      fontSize: 10,
    },
    'adresse_ville': {
      value: address.city,
      x: 150,
      y: 630, // City
      fontSize: 10,
    },
    'adresse_code_postal': {
      value: address.postalCode,
      x: 350,
      y: 630, // Postal code
      fontSize: 10,
    },
    'adresse_pays': {
      value: address.country,
      x: 450,
      y: 630, // Country
      fontSize: 10,
    },

    // SECTION 3: RESPONSABLE LEGAL 1 (Parent/Guardian 1)
    'parent1_civilite': {
      value: mainParent?.type === 'mother' ? 'Mme' : mainParent?.type === 'father' ? 'M.' : 'M./Mme',
      x: 150,
      y: 580, // Title (Mr/Mrs)
      fontSize: 10,
    },
    'parent1_nom': {
      value: mainParent?.lastName || '',
      x: 200,
      y: 580, // Parent last name
      fontSize: 10,
    },
    'parent1_prenom': {
      value: mainParent?.firstName || '',
      x: 350,
      y: 580, // Parent first name
      fontSize: 10,
    },
    'parent1_telephone': {
      value: mainParent?.phone || '',
      x: 150,
      y: 560, // Phone number
      fontSize: 10,
    },
    'parent1_email': {
      value: mainParent?.email || '',
      x: 300,
      y: 560, // Email address
      fontSize: 10,
    },
    'parent1_profession': {
      value: mainParent?.profession || '',
      x: 150,
      y: 540, // Profession
      fontSize: 10,
    },
    'parent1_employeur': {
      value: mainParent?.workAddress?.street || '',
      x: 350,
      y: 540, // Employer/work address
      fontSize: 10,
    },
    'parent1_tel_travail': {
      value: mainParent?.workPhone || '',
      x: 150,
      y: 520, // Work phone
      fontSize: 10,
    },

    // SECTION 4: PERSONNE A CONTACTER EN CAS D'URGENCE (Emergency Contact)
    'urgence_nom': {
      value: family.emergencyContacts?.[0]?.lastName || mainParent?.lastName || '',
      x: 150,
      y: 460, // Emergency contact name
      fontSize: 10,
    },
    'urgence_prenom': {
      value: family.emergencyContacts?.[0]?.firstName || mainParent?.firstName || '',
      x: 300,
      y: 460, // Emergency contact first name
      fontSize: 10,
    },
    'urgence_telephone': {
      value: family.emergencyContacts?.[0]?.phone || mainParent?.phone || '',
      x: 450,
      y: 460, // Emergency phone
      fontSize: 10,
    },
    'urgence_lien': {
      value: family.emergencyContacts?.[0]?.relationship || 'Parent',
      x: 150,
      y: 440, // Relationship to child
      fontSize: 10,
    },

    // SECTION 5: PERSONNE AUTORISEE A RECUPERER L'ENFANT (Authorized pickup persons)
    'autorise1_nom': {
      value: mainParent?.lastName || '',
      x: 150,
      y: 380, // Authorized person 1
      fontSize: 10,
    },
    'autorise1_prenom': {
      value: mainParent?.firstName || '',
      x: 300,
      y: 380,
      fontSize: 10,
    },
    'autorise1_telephone': {
      value: mainParent?.phone || '',
      x: 450,
      y: 380,
      fontSize: 10,
    },

    // SECTION 6: INFORMATIONS MEDICALES (Medical Information)
    'medecin_nom': {
      value: '', // Doctor info not in schema
      x: 150,
      y: 320, // Doctor name
      fontSize: 10,
    },
    'medecin_telephone': {
      value: '', // Doctor phone not in schema
      x: 350,
      y: 320, // Doctor phone
      fontSize: 10,
    },
    'allergies': {
      value: child?.medicalInfo?.allergies?.join(', ') || '',
      x: 150,
      y: 300, // Allergies
      fontSize: 9,
    },
    'medicaments': {
      value: child?.medicalInfo?.medications?.join(', ') || '',
      x: 150,
      y: 280, // Medications
      fontSize: 9,
    },
    'regime_alimentaire': {
      value: child?.medicalInfo?.notes || '',
      x: 150,
      y: 260, // Dietary restrictions (using notes field)
      fontSize: 9,
    },

    // SECTION 7: SIGNATURE ET DATE
    'date_signature': {
      value: new Date().toLocaleDateString('fr-FR'),
      x: 400,
      y: 100, // Signature date
      fontSize: 10,
    },
    'lieu_signature': {
      value: address.city,
      x: 300,
      y: 100, // Place of signature
      fontSize: 10,
    },

    // Additional fields that might be present
    'etablissement': {
      value: 'ALSH - EDPP',
      x: 300,
      y: 780, // Institution name
      fontSize: 12,
    },
    'annee_scolaire': {
      value: '2025-2026',
      x: 450,
      y: 780, // School year
      fontSize: 12,
    },
  };
}
