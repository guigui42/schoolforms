import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, rgb, StandardFonts } from 'pdf-lib';
import type { Family } from '../../types/forms';
import { 
  getTemplate, 
  getTemplateByFilename, 
  getAllTemplates, 
  generateFieldMappingsForTemplate,
  type PDFFieldMapping,
  type PDFTemplate
} from './templates';

/**
 * New PDF Generator using the template system
 * This replaces the legacy pdfGenerator.ts with a cleaner, template-based approach
 */
export class PDFGenerator {
  private pdfDoc: PDFDocument | null = null;
  private currentTemplate: PDFTemplate | null = null;

  async loadTemplate(templateName: string): Promise<void> {
    try {
      console.log(`Loading template: ${templateName}`);
      
      // Check if template exists in our registry
      const template = getTemplateByFilename(templateName);
      if (!template) {
        console.warn(`Template ${templateName} not found in registry, loading as generic PDF`);
      } else {
        console.log(`Found template configuration: ${template.name}`);
        this.currentTemplate = template;
      }

      // Try different encoding approaches for the filename
      const attempts = [
        templateName,
        encodeURIComponent(templateName),
        templateName.replace(/[–]/g, '-'),
        templateName.replace(/['']/g, '\''),
      ];

      for (const attempt of attempts) {
        try {
          const templatePath = `/templates/${attempt}`;
          console.log(`Trying template path: ${templatePath}`);
          
          const response = await fetch(templatePath);
          if (!response.ok) {
            console.log(`Failed attempt with: ${attempt}`);
            continue;
          }

          const arrayBuffer = await response.arrayBuffer();
          console.log(`Template loaded successfully, size: ${arrayBuffer.byteLength} bytes`);
          
          // Validate PDF header
          const firstBytes = new Uint8Array(arrayBuffer.slice(0, 10));
          const firstBytesStr = Array.from(firstBytes).map(b => String.fromCharCode(b)).join('');
          
          if (!firstBytesStr.startsWith('%PDF-')) {
            console.log(`Invalid PDF file - does not start with PDF header`);
            continue;
          }
          
          this.pdfDoc = await PDFDocument.load(arrayBuffer);
          
          console.log(`PDF document loaded with ${this.pdfDoc.getPageCount()} pages`);
          return; // Success!
          
        } catch (error) {
          console.log(`Failed to load with attempt: ${attempt}`, error);
        }
      }

      throw new Error(`Failed to load template: ${templateName}`);
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  getFormFields(): string[] {
    if (!this.pdfDoc) {
      throw new Error('No PDF document loaded');
    }

    const form = this.pdfDoc.getForm();
    return form.getFields().map(field => field.getName());
  }

  fillFormFields(fieldMappings: Record<string, string>): void {
    if (!this.pdfDoc) {
      throw new Error('No PDF document loaded');
    }

    const form = this.pdfDoc.getForm();
    const fields = form.getFields();

    console.log('Available form fields:', fields.map(f => f.getName()));
    console.log('Field mappings to apply:', fieldMappings);

    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      try {
        const field = form.getField(fieldName);
        if (field) {
          console.log(`Setting field ${fieldName} to: ${value}`);
          // Handle different field types
          if (field.constructor.name === 'PDFTextField') {
            (field as PDFTextField).setText(value);
          } else if (field.constructor.name === 'PDFCheckBox') {
            (field as PDFCheckBox).check();
          } else if (field.constructor.name === 'PDFRadioGroup') {
            (field as PDFRadioGroup).select(value);
          }
        } else {
          console.warn(`Field ${fieldName} not found in PDF form`);
        }
      } catch (error) {
        console.error(`Error setting field ${fieldName}:`, error);
      }
    });
  }

  async addTextAtCoordinates(coordinateMappings: Record<string, PDFFieldMapping>): Promise<void> {
    if (!this.pdfDoc) {
      throw new Error('No PDF document loaded');
    }

    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

    console.log('Adding text at coordinates:', coordinateMappings);

    Object.entries(coordinateMappings).forEach(([, mapping]) => {
      const { value, coordinate } = mapping;
      const { x, y, fontSize = 10, fontColor = [0, 0, 0] } = coordinate;

      if (value && value.trim()) {
        console.log(`Adding text "${value}" at (${x}, ${y}) with font size ${fontSize}`);
        
        firstPage.drawText(value, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(fontColor[0], fontColor[1], fontColor[2]),
        });
      }
    });
  }

  async generatePDFForFamily(family: Family, templateId: string): Promise<Uint8Array> {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Load the template
    await this.loadTemplate(template.fileName);

    // Generate field mappings using the template
    const fieldMappings = generateFieldMappingsForTemplate(templateId, family);
    if (!fieldMappings) {
      throw new Error(`Failed to generate field mappings for template ${templateId}`);
    }

    // Try to fill form fields first
    try {
      const simpleFieldMappings: Record<string, string> = {};
      Object.entries(fieldMappings).forEach(([key, mapping]) => {
        simpleFieldMappings[key] = mapping.value;
      });
      this.fillFormFields(simpleFieldMappings);
    } catch (error) {
      console.log('Form field filling failed, continuing with coordinate-based approach:', error);
    }

    // Add text using coordinates
    await this.addTextAtCoordinates(fieldMappings);

    // Generate PDF
    if (!this.pdfDoc) {
      throw new Error('No PDF document loaded');
    }

    return await this.pdfDoc.save();
  }

  async downloadPDF(filename: string): Promise<void> {
    if (!this.pdfDoc) {
      throw new Error('No PDF document loaded');
    }

    const pdfBytes = await this.pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Helper method to get all available templates
  getAvailableTemplates(): PDFTemplate[] {
    return getAllTemplates();
  }

  // Helper method to get current template info
  getCurrentTemplate(): PDFTemplate | null {
    return this.currentTemplate;
  }

  // Helper method to generate and download PDF for a specific template
  async generateAndDownloadPDF(family: Family, templateId: string, filename?: string): Promise<void> {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Generate the PDF
    const pdfBytes = await this.generatePDFForFamily(family, templateId);
    
    // Create blob and download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${family.address.city.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Legacy compatibility functions - kept for backward compatibility
export function createFieldMappingsFromFamily(family: Family): Record<string, string> {
  // This is kept for backward compatibility
  const template = getTemplate('alsh-edpp-2025-2026');
  if (!template) {
    return {};
  }

  const mappings = template.getFieldMappings(family);
  const simpleMapping: Record<string, string> = {};
  
  Object.entries(mappings).forEach(([key, mapping]) => {
    simpleMapping[key] = mapping.value;
  });

  return simpleMapping;
}

export function createCoordinateMappingsFromFamily(family: Family): Record<string, PDFFieldMapping> {
  // This is kept for backward compatibility
  const template = getTemplate('alsh-edpp-2025-2026');
  if (!template) {
    return {};
  }

  return template.getFieldMappings(family);
}
