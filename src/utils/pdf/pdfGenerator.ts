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
 * Create field mappings from family data
 */
export function createFieldMappingsFromFamily(family: Family): PDFFieldMapping {
  const address = family.address;
  const mainParent = family.parents?.[0];
  
  return {
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
    
    // Parent/Family information
    'nom': { value: mainParent?.lastName || '' },
    'nom_famille': { value: mainParent?.lastName || '' },
    'lastname': { value: mainParent?.lastName || '' },
    'nom_parent': { value: mainParent?.lastName || '' },
    
    'prenom': { value: mainParent?.firstName || '' },
    'prenom_parent': { value: mainParent?.firstName || '' },
    'firstname': { value: mainParent?.firstName || '' },
    
    'email': { value: mainParent?.email || '' },
    'mail': { value: mainParent?.email || '' },
    'adresse_email': { value: mainParent?.email || '' },
    
    'telephone': { value: mainParent?.phone || '' },
    'phone': { value: mainParent?.phone || '' },
    'tel': { value: mainParent?.phone || '' },
    
    // Full address field
    'adresse_complete': {
      value: `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`,
    },
    
    // Child information (if available)
    'enfant_nom': { value: family.students?.[0]?.lastName || mainParent?.lastName || '' },
    'enfant_prenom': { value: family.students?.[0]?.firstName || '' },
    'child_name': { value: family.students?.[0]?.firstName || '' },
    'nom_enfant': { value: family.students?.[0]?.firstName || '' },
  };
}

/**
 * Create coordinate-based mappings for EDPP form (Petit Prince)
 * These coordinates are based on the actual PDF form structure
 */
export function createCoordinateMappingsFromFamily(family: Family): PDFFieldMapping {
  const address = family.address;
  
  return {
    // Address fields for the EDPP form - these coordinates need to be adjusted based on the actual form
    'famille_nom': {
      value: family.parents?.[0]?.lastName || '',
      x: 150,
      y: 735, // Near the top where family name might be
      fontSize: 10,
    },
    'famille_prenom': {
      value: family.parents?.[0]?.firstName || '',
      x: 280,
      y: 735,
      fontSize: 10,
    },
    'adresse_rue': {
      value: address.street,
      x: 150,
      y: 715, // Below the name fields
      fontSize: 10,
    },
    'adresse_code_postal': {
      value: address.postalCode,
      x: 450,
      y: 715,
      fontSize: 10,
    },
    'adresse_ville': {
      value: address.city,
      x: 500,
      y: 715,
      fontSize: 10,
    },
    'adresse_pays': {
      value: address.country,
      x: 600,
      y: 715,
      fontSize: 10,
    },
    // Additional fields that might be needed
    'etablissement_nom': {
      value: 'Baobab du Petit Prince',
      x: 400,
      y: 250, // Near the header area
      fontSize: 12,
    },
  };
}
