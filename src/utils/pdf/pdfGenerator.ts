/**
 * Clean PDF Generator with Editable Forms
 * 
 * This module generates PDFs with editable form fields, allowing users
 * to modify values manually after generation.
 */

import { PDFDocument, PDFPage, PDFFont, PDFForm, rgb, StandardFonts } from 'pdf-lib';
import type { FormTemplate, FormSection, FormField } from './formTemplates';
import type { Family } from '../../types/forms';

// PDF styling constants
const PDF_CONFIG = {
  pageSize: {
    width: 595, // A4 width in points
    height: 842  // A4 height in points
  },
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  },
  fonts: {
    title: { size: 16, color: rgb(0, 0, 0) },
    sectionTitle: { size: 12, color: rgb(0, 0, 0) },
    label: { size: 9, color: rgb(0.3, 0.3, 0.3) },
    value: { size: 10, color: rgb(0, 0, 0) }
  },
  spacing: {
    sectionGap: 25,
    fieldGap: 15,
    labelValueGap: 3
  },
  field: {
    height: 20,
    borderColor: rgb(0.8, 0.8, 0.8),
    backgroundColor: rgb(0.98, 0.98, 0.98)
  }
} as const;

// PDF generation options
export interface PDFGenerationOptions {
  editable?: boolean; // Whether to create editable form fields
  filename?: string;  // Custom filename for download
  showEditableNotice?: boolean; // Show notice about editable fields
}

export class PDFGenerator {
  private pdfDoc: PDFDocument | null = null;
  private currentPage: PDFPage | null = null;
  private font: PDFFont | null = null;
  private boldFont: PDFFont | null = null;
  private form: PDFForm | null = null;
  private currentY: number = 0;
  private fieldCounter: number = 0; // For unique field names
  private options: PDFGenerationOptions = {};

  async initialize(): Promise<void> {
    this.pdfDoc = await PDFDocument.create();
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    this.form = this.pdfDoc.getForm();
    this.fieldCounter = 0;
    
    // Create first page
    this.addNewPage();
  }

  private addNewPage(): void {
    if (!this.pdfDoc) throw new Error('PDF document not initialized');
    
    this.currentPage = this.pdfDoc.addPage([PDF_CONFIG.pageSize.width, PDF_CONFIG.pageSize.height]);
    this.currentY = PDF_CONFIG.pageSize.height - PDF_CONFIG.margins.top;
  }

  private checkPageSpace(requiredHeight: number): void {
    if (this.currentY - requiredHeight < PDF_CONFIG.margins.bottom) {
      this.addNewPage();
    }
  }

  private drawText(
    text: string, 
    x: number, 
    y: number, 
    options: {
      size?: number;
      color?: ReturnType<typeof rgb>;
      font?: PDFFont;
      maxWidth?: number;
    } = {}
  ): void {
    if (!this.currentPage || !this.font) return;

    const font = options.font || this.font;
    const size = options.size || PDF_CONFIG.fonts.value.size;
    const color = options.color || PDF_CONFIG.fonts.value.color;
    const maxWidth = options.maxWidth || (PDF_CONFIG.pageSize.width - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right);

    // Handle text wrapping for long text
    const displayText = text;
    if (font.widthOfTextAtSize(text, size) > maxWidth) {
      // Simple word wrapping - can be enhanced
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
          line = testLine;
        } else {
          if (line) {
            this.currentPage.drawText(line, { x, y, size, font, color });
            y -= size + 2;
            line = word;
          } else {
            // Single word too long, truncate
            line = word.substring(0, Math.floor(word.length * maxWidth / font.widthOfTextAtSize(word, size)));
          }
        }
      }
      if (line) {
        this.currentPage.drawText(line, { x, y, size, font, color });
      }
    } else {
      this.currentPage.drawText(displayText, { x, y, size, font, color });
    }
  }

  private drawFieldBox(x: number, y: number, width: number, height: number): void {
    if (!this.currentPage) return;

    // Draw field background
    this.currentPage.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: PDF_CONFIG.field.backgroundColor,
      borderColor: PDF_CONFIG.field.borderColor,
      borderWidth: 0.5
    });
  }

  private renderTitle(title: string): void {
    this.checkPageSpace(30);
    
    const x = PDF_CONFIG.pageSize.width / 2;
    this.drawText(title, x - (this.boldFont!.widthOfTextAtSize(title, PDF_CONFIG.fonts.title.size) / 2), this.currentY, {
      size: PDF_CONFIG.fonts.title.size,
      color: PDF_CONFIG.fonts.title.color,
      font: this.boldFont!
    });
    
    this.currentY -= 40;
  }

  private renderSectionTitle(title: string): void {
    this.checkPageSpace(25);
    
    this.drawText(title, PDF_CONFIG.margins.left, this.currentY, {
      size: PDF_CONFIG.fonts.sectionTitle.size,
      color: PDF_CONFIG.fonts.sectionTitle.color,
      font: this.boldFont!
    });
    
    this.currentY -= PDF_CONFIG.spacing.sectionGap;
  }

  private renderField(field: FormField, value: string | boolean | number, isLeftColumn: boolean = true): void {
    this.checkPageSpace(PDF_CONFIG.field.height + 10);
    
    const fieldWidth = (PDF_CONFIG.pageSize.width - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right - 20) / 2;
    const x = isLeftColumn 
      ? PDF_CONFIG.margins.left 
      : PDF_CONFIG.margins.left + fieldWidth + 20;
    
    // Draw label
    this.drawText(field.label + (field.required ? ' *' : ''), x, this.currentY, {
      size: PDF_CONFIG.fonts.label.size,
      color: PDF_CONFIG.fonts.label.color
    });
    
    this.currentY -= PDF_CONFIG.spacing.labelValueGap + PDF_CONFIG.fonts.label.size;
    
    // Create form field or static content based on options
    if (this.options.editable !== false && this.form && this.currentPage) {
      this.createEditableField(field, value, x, fieldWidth);
    } else {
      this.createStaticField(field, value, x, fieldWidth);
    }
    
    if (!isLeftColumn) {
      this.currentY -= PDF_CONFIG.field.height + PDF_CONFIG.spacing.fieldGap;
    }
  }

  private createEditableField(field: FormField, value: string | boolean | number, x: number, fieldWidth: number): void {
    if (!this.form || !this.currentPage) return;
    
    // Create unique field name
    const fieldName = `${field.id}_${this.fieldCounter++}`;
    
    // Calculate field rectangle (PDF coordinate system has origin at bottom-left)
    const fieldRect = {
      x,
      y: this.currentY - PDF_CONFIG.field.height,
      width: fieldWidth,
      height: PDF_CONFIG.field.height
    };
    
    // Create appropriate form field based on type
    try {
      switch (field.type) {
        case 'checkbox': {
          const checkBox = this.form.createCheckBox(fieldName);
          checkBox.addToPage(this.currentPage, fieldRect);
          
          // Set initial value
          if (typeof value === 'boolean' && value) {
            checkBox.check();
          }
          break;
        }
        
        case 'select': {
          if (field.options && field.options.length > 0) {
            const dropdown = this.form.createDropdown(fieldName);
            dropdown.addToPage(this.currentPage, fieldRect);
            dropdown.addOptions(field.options);
            
            // Set initial value if it matches an option
            const stringValue = String(value || '');
            if (field.options.includes(stringValue)) {
              dropdown.select(stringValue);
            }
          } else {
            // Fallback to text field if no options
            this.createTextField(fieldName, fieldRect, String(value || ''));
          }
          break;
        }
        
        case 'textarea':
        case 'text':
        case 'email':
        case 'phone':
        case 'date':
        default: {
          this.createTextField(fieldName, fieldRect, String(value || ''), field.type === 'textarea');
          break;
        }
      }
    } catch (error) {
      console.warn(`Failed to create form field ${fieldName}:`, error);
      // Fallback to static field
      this.createStaticField(field, value, x, fieldWidth);
    }
  }

  private createStaticField(field: FormField, value: string | boolean | number, x: number, fieldWidth: number): void {
    // Draw field box
    this.drawFieldBox(x, this.currentY, fieldWidth, PDF_CONFIG.field.height);
    
    // Draw value
    const displayValue = typeof value === 'boolean' 
      ? (field.type === 'checkbox' ? (value ? '[X]' : '[ ]') : (value ? 'Oui' : 'Non'))
      : String(value || '');
    
    if (displayValue) {
      this.drawText(displayValue, x + 5, this.currentY - 6, {
        size: PDF_CONFIG.fonts.value.size,
        color: PDF_CONFIG.fonts.value.color,
        maxWidth: fieldWidth - 10
      });
    }
  }

  private createTextField(fieldName: string, rect: { x: number; y: number; width: number; height: number }, value: string, isMultiline: boolean = false): void {
    if (!this.form || !this.currentPage) return;
    
    const textField = this.form.createTextField(fieldName);
    textField.addToPage(this.currentPage, rect);
    textField.setText(value);
    
    if (isMultiline) {
      textField.enableMultiline();
    }
  }

  private renderSection(section: FormSection, data: Record<string, string | boolean | number>): void {
    this.renderSectionTitle(section.title);
    
    // Render fields in two columns when possible
    for (let i = 0; i < section.fields.length; i += 2) {
      const leftField = section.fields[i];
      const rightField = section.fields[i + 1];
      
      const leftValue = data[leftField.id] || '';
      
      // Render left field
      this.renderField(leftField, leftValue, true);
      
      // Render right field if exists
      if (rightField) {
        const rightValue = data[rightField.id] || '';
        this.renderField(rightField, rightValue, false);
      } else {
        // No right field, move to next row
        this.currentY -= PDF_CONFIG.field.height + PDF_CONFIG.spacing.fieldGap;
      }
    }
    
    this.currentY -= 10; // Extra space after section
  }

  async generatePDF(template: FormTemplate, family: Family, options: PDFGenerationOptions = {}): Promise<Uint8Array> {
    this.options = { editable: true, showEditableNotice: true, ...options };
    await this.initialize();
    
    if (!this.pdfDoc) throw new Error('Failed to initialize PDF document');
    
    // Extract data from family
    const data = template.extractData(family);
    
    // Render title
    this.renderTitle(template.title);
    
    // Render each section
    for (const section of template.sections) {
      this.renderSection(section, data);
    }
    
    // Add footer with generation info
    this.renderFooter();
    
    // Return PDF bytes
    return await this.pdfDoc.save();
  }

  private renderFooter(): void {
    if (!this.currentPage || !this.font) return;
    
    const footerY = PDF_CONFIG.margins.bottom - 30;
    const generationText = `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    
    // Draw generation info
    const generationWidth = this.font.widthOfTextAtSize(generationText, 8);
    const generationX = (PDF_CONFIG.pageSize.width - generationWidth) / 2;
    this.drawText(generationText, generationX, footerY, {
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Draw editable info if enabled
    if (this.options.editable !== false && this.options.showEditableNotice !== false) {
      const editableText = `[EDITABLE] Ce formulaire est éditable - Vous pouvez modifier les champs directement dans le PDF`;
      const editableWidth = this.font.widthOfTextAtSize(editableText, 8);
      const editableX = (PDF_CONFIG.pageSize.width - editableWidth) / 2;
      this.drawText(editableText, editableX, footerY - 12, {
        size: 8,
        color: rgb(0, 0.5, 0)
      });
    }
  }
}

// Helper function to generate and download PDF
export async function generateAndDownloadPDF(
  template: FormTemplate, 
  family: Family, 
  options: PDFGenerationOptions = {}
): Promise<void> {
  const generator = new PDFGenerator();
  const pdfBytes = await generator.generatePDF(template, family, options);
  
  // Create blob and download
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename || `${template.name}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Helper function to preview PDF in new tab
export async function previewPDF(
  template: FormTemplate, 
  family: Family, 
  options: PDFGenerationOptions = {}
): Promise<void> {
  const generator = new PDFGenerator();
  const pdfBytes = await generator.generatePDF(template, family, options);
  
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  window.open(url, '_blank');
  
  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
