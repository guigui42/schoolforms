/**
 * PDF Form Field Filler
 * 
 * This module loads existing PDF templates with pre-defined form fields
 * and fills them with data from our application, maintaining the exact
 * visual appearance of the original forms.
 */

import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from 'pdf-lib';
import type { Family } from '../../types/forms';
import { getTemplateConfig, extractTemplateData, TEMPLATE_CONFIGS, type TemplateConfig, type PDFFieldMapping } from './templateMappings';

// Re-export types and configs for convenience
export type { TemplateConfig, PDFFieldMapping } from './templateMappings';
export const TEMPLATE_MAPPINGS = TEMPLATE_CONFIGS;
export { extractTemplateData } from './templateMappings';

export class PDFFormFiller {
  private pdfDoc: PDFDocument | null = null;
  private form: PDFForm | null = null;
  private debugMode: boolean = false;
  private silentMode: boolean = false;

  constructor(options: { debug?: boolean; silent?: boolean } = {}) {
    this.debugMode = options.debug || false;
    this.silentMode = options.silent || false;
  }

  private log(message: string, ...args: unknown[]) {
    if (this.debugMode) {
      console.log(message, ...args);
    }
  }

  private warn(message: string, ...args: unknown[]) {
    if (!this.silentMode) {
      console.warn(message, ...args);
    }
  }

  /**
   * Load a PDF template from the public/templates directory
   */
  async loadTemplate(templateId: string): Promise<void> {
    const config = getTemplateConfig(templateId);
    if (!config) {
      throw new Error(`Template "${templateId}" not found`);
    }    try {
      this.log(`Loading template: ${templateId} from ${config.templatePath}`);

      // Fetch the PDF template
      const response = await fetch(config.templatePath);
      this.log(`Fetch response status: ${response.status} ${response.statusText}`);
      this.log(`Content-Type: ${response.headers.get('content-type')}`);
      this.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const pdfArrayBuffer = await response.arrayBuffer();
      console.log(`PDF ArrayBuffer size: ${pdfArrayBuffer.byteLength} bytes`);
      
      // Check if we got a valid PDF by looking at the first few bytes
      const firstBytes = new Uint8Array(pdfArrayBuffer.slice(0, 8));
      const firstBytesStr = Array.from(firstBytes).map(b => String.fromCharCode(b)).join('');
      console.log(`First 8 bytes: ${firstBytesStr} (should start with "%PDF-")`);
      
      if (!firstBytesStr.startsWith('%PDF-')) {
        console.error('File does not appear to be a valid PDF');
        console.log('First 100 characters of response:', 
          Array.from(new Uint8Array(pdfArrayBuffer.slice(0, 100)))
            .map(b => String.fromCharCode(b)).join(''));
        throw new Error('Downloaded file is not a valid PDF (missing PDF header)');
      }
      
      // Load the PDF document
      this.pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      this.form = this.pdfDoc.getForm();
      
      console.log(`Successfully loaded template: ${templateId}`);
      
      // Debug: List all form fields in the PDF
      this.listFormFields();
      
    } catch (error) {
      console.error(`Error loading template "${templateId}":`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to load PDF template: ${error.message}`);
      } else {
        throw new Error(`Failed to load PDF template: Unknown error`);
      }
    }
  }

  /**
   * Debug method to list all form fields in the loaded PDF
   */
  private listFormFields(): void {
    if (!this.form) {
      console.log('No form found in PDF');
      return;
    }

    const fields = this.form.getFields();
    console.log(`Found ${fields.length} form fields:`);
    
    fields.forEach((field, index) => {
      const name = field.getName();
      const type = field.constructor.name;
      console.log(`  ${index + 1}. "${name}" (${type})`);
    });
  }

  /**
   * Fill form fields with data using the new template mapping system
   */
  async fillForm(templateId: string, family: Family): Promise<void> {
    if (!this.pdfDoc || !this.form) {
      throw new Error('PDF template not loaded. Call loadTemplate() first.');
    }

    const config = getTemplateConfig(templateId);
    if (!config) {
      throw new Error(`Template configuration not found: ${templateId}`);
    }

    const data = extractTemplateData(templateId, family);

    // console.log('Filling form with data:', data);
    console.log(`📝 Filling "${templateId}" template with ${Object.keys(data).length} data fields...`);

    // Fill each mapped field based on the template configuration
    for (const fieldMapping of config.fields) {
      const pdfFieldName = fieldMapping.pdfFieldName;
      const value = data[pdfFieldName];
      
      try {
        const field = this.form.getField(pdfFieldName);
        
        if (field) {
          // Handle different field types using type checking
          if ('setText' in field) {
            // Text field
            const textField = field as PDFTextField;
            textField.setText(String(value || ''));
            // console.log(`Set text field "${pdfFieldName}" = "${value}"`);
            
          } else if ('check' in field) {
            // Checkbox field
            const checkboxField = field as PDFCheckBox;
            if (value === true) {
              checkboxField.check();
              // console.log(`Checked checkbox "${pdfFieldName}"`);
            } else {
              checkboxField.uncheck();
              // console.log(`Unchecked checkbox "${pdfFieldName}"`);
            }
            
          } else if ('getOptions' in field && 'select' in field) {
            // Radio button group or dropdown
            const selectableField = field as PDFRadioGroup | PDFDropdown;
            if (value === true && selectableField.getOptions().length > 0) {
              selectableField.select(selectableField.getOptions()[0]);
              // console.log(`Selected field "${pdfFieldName}"`);
            } else if (typeof value === 'string' && selectableField.getOptions().includes(value)) {
              selectableField.select(value);
              // console.log(`Selected field "${pdfFieldName}" = "${value}"`);
            }
          }
        } else {
          this.warn(`⚠️  Field "${pdfFieldName}" not found in PDF template (skipping)`);
        }
        
      } catch (error) {
        // Gracefully handle missing fields - this is common during development
        if (error instanceof Error && error.message.includes('no form field with the name')) {
          this.warn(`⚠️  Field "${pdfFieldName}" not found in PDF template (skipping)`);
        } else {
          this.warn(`⚠️  Could not fill field "${pdfFieldName}":`, error instanceof Error ? error.message : error);
        }
        // Continue processing other fields instead of failing
      }
    }
    
    // Summary log
    const totalFields = config.fields.length;
    console.log(`✅ Form filling completed for "${templateId}" (${totalFields} fields processed)`);
  }

  /**
   * Generate the filled PDF as bytes
   */
  async generatePDF(): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('PDF template not loaded');
    }

    return await this.pdfDoc.save();
  }

  /**
   * Complete workflow: load template, fill form, and return PDF bytes
   */
  async generateFilledPDF(templateId: string, family: Family): Promise<Uint8Array> {
    await this.loadTemplate(templateId);
    await this.fillForm(templateId, family);
    return await this.generatePDF();
  }
}

// Helper functions for easy use

/**
 * Generate and download a filled PDF
 */
export async function generateAndDownloadFilledPDF(
  templateName: string,
  family: Family,
  filename?: string
): Promise<void> {
  const filler = new PDFFormFiller();
  const pdfBytes = await filler.generateFilledPDF(templateName, family);
  
  // Create blob and download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${templateName}_filled_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Preview a filled PDF in a new tab
 */
export async function previewFilledPDF(
  templateName: string,
  family: Family
): Promise<void> {
  const filler = new PDFFormFiller();
  const pdfBytes = await filler.generateFilledPDF(templateName, family);
  
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  window.open(url, '_blank');
  
  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Debug function to analyze a PDF template's form fields
 */
export async function analyzePDFTemplate(templateName: string): Promise<string[]> {
  const mapping = TEMPLATE_MAPPINGS[templateName];
  if (!mapping) {
    throw new Error(`Template "${templateName}" not found`);
  }

  try {
    const response = await fetch(mapping.templatePath);
    const pdfArrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const form = pdfDoc.getForm();
    
    const fields = form.getFields();
    return fields.map(field => {
      const name = field.getName();
      const type = field.constructor.name;
      return `${name} (${type})`;
    });
    
  } catch (error) {
    console.error(`Error analyzing template "${templateName}":`, error);
    throw error;
  }
}

/**
 * Test if a template file is accessible and valid
 */
export async function testTemplateAccessibility(templateName: string): Promise<{
  accessible: boolean;
  status?: number;
  contentType?: string;
  size?: number;
  error?: string;
  isPDF?: boolean;
}> {
  const mapping = TEMPLATE_MAPPINGS[templateName];
  if (!mapping) {
    return {
      accessible: false,
      error: `Template "${templateName}" not found in mappings`
    };
  }

  try {
    // console.log(`Testing accessibility of template: ${templateName} at ${mapping.templatePath}`);
    
    const response = await fetch(mapping.templatePath);
    const contentType = response.headers.get('content-type') || 'unknown';
    
    if (!response.ok) {
      return {
        accessible: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    // Check if we can read the content
    const buffer = await response.arrayBuffer();
    const size = buffer.byteLength;
    
    // Check if it's a valid PDF
    const firstBytes = new Uint8Array(buffer.slice(0, 8));
    const firstBytesStr = Array.from(firstBytes).map(b => String.fromCharCode(b)).join('');
    const isPDF = firstBytesStr.startsWith('%PDF-');
    
    return {
      accessible: true,
      status: response.status,
      contentType,
      size,
      isPDF
    };
    
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
