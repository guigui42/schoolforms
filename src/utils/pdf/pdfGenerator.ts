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
    top: 60,
    bottom: 60,
    left: 60,
    right: 60
  },
  colors: {
    primary: rgb(0.2, 0.4, 0.8),      // Professional blue
    secondary: rgb(0.3, 0.5, 0.9),    // Lighter blue
    accent: rgb(0.8, 0.2, 0.4),       // Accent red
    text: {
      primary: rgb(0.1, 0.1, 0.1),    // Near black
      secondary: rgb(0.4, 0.4, 0.4),  // Medium gray
      light: rgb(0.6, 0.6, 0.6)       // Light gray
    },
    background: {
      white: rgb(1, 1, 1),
      lightGray: rgb(0.97, 0.97, 0.97),
      veryLight: rgb(0.99, 0.99, 0.99)
    },
    border: {
      light: rgb(0.85, 0.85, 0.85),
      medium: rgb(0.7, 0.7, 0.7),
      dark: rgb(0.5, 0.5, 0.5)
    }
  },
  fonts: {
    title: { size: 18, weight: 'bold' },
    subtitle: { size: 14, weight: 'bold' },
    sectionTitle: { size: 13, weight: 'bold' },
    subsectionTitle: { size: 11, weight: 'bold' },
    label: { size: 9, weight: 'normal' },
    value: { size: 10, weight: 'normal' },
    footer: { size: 8, weight: 'normal' }
  },
  spacing: {
    titleGap: 25,
    sectionGap: 20,
    subsectionGap: 15,
    fieldGap: 18,
    labelValueGap: 6,
    lineHeight: 1.4
  },
  field: {
    height: 22,
    borderWidth: 1,
    cornerRadius: 2,
    padding: {
      horizontal: 8,
      vertical: 4
    }
  },
  layout: {
    twoColumnThreshold: 4, // Switch to two columns if section has more than 4 fields
    columnGap: 25
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
    const color = options.color || PDF_CONFIG.colors.text.primary;
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

    // Draw field background with subtle shadow effect
    this.currentPage.drawRectangle({
      x: x + 1,
      y: y - height + 1,
      width,
      height,
      color: rgb(0.92, 0.92, 0.92) // Shadow
    });

    // Draw main field background
    this.currentPage.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: PDF_CONFIG.colors.background.white,
      borderColor: PDF_CONFIG.colors.border.medium,
      borderWidth: PDF_CONFIG.field.borderWidth
    });
    
    // Draw subtle inner highlight
    this.currentPage.drawRectangle({
      x: x + 1,
      y: y - 2,
      width: width - 2,
      height: 1,
      color: PDF_CONFIG.colors.background.lightGray
    });
  }

  private renderTitle(title: string): void {
    this.checkPageSpace(50);
    
    // Draw decorative header background
    const headerHeight = 40;
    const headerY = this.currentY - headerHeight;
    
    this.currentPage?.drawRectangle({
      x: 0,
      y: headerY,
      width: PDF_CONFIG.pageSize.width,
      height: headerHeight,
      color: PDF_CONFIG.colors.primary
    });
    
    // Draw accent gradient effect (simulated with multiple rectangles)
    for (let i = 0; i < 3; i++) {
      const opacity = 0.1 - (i * 0.03);
      this.currentPage?.drawRectangle({
        x: 0,
        y: headerY + headerHeight - (i + 1) * 2,
        width: PDF_CONFIG.pageSize.width,
        height: 2,
        color: rgb(
          PDF_CONFIG.colors.primary.red + opacity,
          PDF_CONFIG.colors.primary.green + opacity,
          PDF_CONFIG.colors.primary.blue + opacity
        )
      });
    }
    
    // Calculate centered position for title text
    const x = PDF_CONFIG.pageSize.width / 2;
    const titleWidth = this.boldFont!.widthOfTextAtSize(title, PDF_CONFIG.fonts.title.size);
    // Position text baseline to center it vertically in the header
    // Text baseline should be at center minus half the text height
    const textY = headerY + (headerHeight / 2) + (PDF_CONFIG.fonts.title.size * 0.35);
    
    this.drawText(title, x - (titleWidth / 2), textY, {
      size: PDF_CONFIG.fonts.title.size,
      color: rgb(1, 1, 1), // White text on blue background
      font: this.boldFont!
    });
    
    this.currentY = headerY - PDF_CONFIG.spacing.titleGap;
  }

  private renderSectionTitle(title: string): void {
    this.checkPageSpace(35);
    
    // Draw section background bar
    const barHeight = 25;
    const barY = this.currentY - barHeight;
    
    this.currentPage?.drawRectangle({
      x: PDF_CONFIG.margins.left - 10,
      y: barY,
      width: PDF_CONFIG.pageSize.width - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right + 20,
      height: barHeight,
      color: PDF_CONFIG.colors.background.lightGray,
      borderColor: PDF_CONFIG.colors.border.light,
      borderWidth: 0.5
    });
    
    // Draw accent line on the left
    this.currentPage?.drawRectangle({
      x: PDF_CONFIG.margins.left - 10,
      y: barY,
      width: 4,
      height: barHeight,
      color: PDF_CONFIG.colors.primary
    });
    
    // Center the text vertically in the bar
    const textY = barY + (barHeight / 2) + (PDF_CONFIG.fonts.sectionTitle.size * 0.35);
    
    this.drawText(title, PDF_CONFIG.margins.left, textY, {
      size: PDF_CONFIG.fonts.sectionTitle.size,
      color: PDF_CONFIG.colors.text.primary,
      font: this.boldFont!
    });
    
    this.currentY = barY - PDF_CONFIG.spacing.sectionGap;
  }

  private renderField(field: FormField, value: string | boolean | number, isLeftColumn: boolean = true): void {
    this.checkPageSpace(PDF_CONFIG.field.height + 15);
    
    const contentWidth = PDF_CONFIG.pageSize.width - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
    const fieldWidth = (contentWidth - PDF_CONFIG.layout.columnGap) / 2;
    const x = isLeftColumn 
      ? PDF_CONFIG.margins.left 
      : PDF_CONFIG.margins.left + fieldWidth + PDF_CONFIG.layout.columnGap;
    
    // Draw label with improved styling
    const labelText = field.label + (field.required ? ' *' : '');
    this.drawText(labelText, x, this.currentY, {
      size: PDF_CONFIG.fonts.label.size,
      color: field.required ? PDF_CONFIG.colors.accent : PDF_CONFIG.colors.text.secondary,
      font: field.required ? this.boldFont! : this.font!
    });
    
    // Move to field position with consistent spacing
    this.currentY -= PDF_CONFIG.fonts.label.size + PDF_CONFIG.spacing.labelValueGap;
    
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
      // Calculate proper text positioning within the field box
      // Field box coordinates: top = this.currentY, bottom = this.currentY - PDF_CONFIG.field.height
      const fieldBoxBottom = this.currentY - PDF_CONFIG.field.height;
      
      // Calculate the vertical center of the field box
      const fieldBoxCenter = fieldBoxBottom + (PDF_CONFIG.field.height / 2);
      
      // Position text baseline to center it visually in the field box
      // For 10pt font, we need to adjust by approximately 30% of font size above center
      const textY = fieldBoxCenter + (PDF_CONFIG.fonts.value.size * 0.3);
      
      this.drawText(displayValue, x + PDF_CONFIG.field.padding.horizontal, textY, {
        size: PDF_CONFIG.fonts.value.size,
        color: PDF_CONFIG.colors.text.primary,
        maxWidth: fieldWidth - (PDF_CONFIG.field.padding.horizontal * 2)
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
    
    // Use two columns for sections with many fields, single column for few fields
    const useColumns = section.fields.length >= PDF_CONFIG.layout.twoColumnThreshold;
    
    if (useColumns) {
      // Render fields in two columns when there are many fields
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
    } else {
      // Single column layout for sections with few fields
      for (const field of section.fields) {
        const value = data[field.id] || '';
        this.renderFieldFullWidth(field, value);
      }
    }
    
    this.currentY -= PDF_CONFIG.spacing.subsectionGap; // Extra space after section
  }

  private renderFieldFullWidth(field: FormField, value: string | boolean | number): void {
    this.checkPageSpace(PDF_CONFIG.field.height + 15);
    
    const contentWidth = PDF_CONFIG.pageSize.width - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
    const x = PDF_CONFIG.margins.left;
    
    // Draw label with improved styling
    const labelText = field.label + (field.required ? ' *' : '');
    this.drawText(labelText, x, this.currentY, {
      size: PDF_CONFIG.fonts.label.size,
      color: field.required ? PDF_CONFIG.colors.accent : PDF_CONFIG.colors.text.secondary,
      font: field.required ? this.boldFont! : this.font!
    });
    
    // Move to field position with consistent spacing
    this.currentY -= PDF_CONFIG.fonts.label.size + PDF_CONFIG.spacing.labelValueGap;
    
    // Create form field or static content based on options
    if (this.options.editable !== false && this.form && this.currentPage) {
      this.createEditableField(field, value, x, contentWidth);
    } else {
      this.createStaticField(field, value, x, contentWidth);
    }
    
    this.currentY -= PDF_CONFIG.field.height + PDF_CONFIG.spacing.fieldGap;
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
    
    const footerY = PDF_CONFIG.margins.bottom;
    
    // Draw footer separator line
    this.currentPage.drawLine({
      start: { x: PDF_CONFIG.margins.left, y: footerY + 20 },
      end: { x: PDF_CONFIG.pageSize.width - PDF_CONFIG.margins.right, y: footerY + 20 },
      thickness: 0.5,
      color: PDF_CONFIG.colors.border.light
    });
    
    // Draw generation info with better styling
    const generationText = `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    const generationWidth = this.font.widthOfTextAtSize(generationText, PDF_CONFIG.fonts.footer.size);
    const generationX = (PDF_CONFIG.pageSize.width - generationWidth) / 2;
    
    this.drawText(generationText, generationX, footerY, {
      size: PDF_CONFIG.fonts.footer.size,
      color: PDF_CONFIG.colors.text.light
    });
    
    // Draw editable info if enabled with improved styling
    if (this.options.editable !== false && this.options.showEditableNotice !== false) {
      const editableText = `[EDITABLE] FORMULAIRE ÉDITABLE - Vous pouvez modifier les champs directement dans ce PDF`;
      const editableWidth = this.font.widthOfTextAtSize(editableText, PDF_CONFIG.fonts.footer.size);
      const editableX = (PDF_CONFIG.pageSize.width - editableWidth) / 2;
      
      // Draw background for editable notice
      this.currentPage.drawRectangle({
        x: editableX - 10,
        y: footerY - 25,
        width: editableWidth + 20,
        height: 14,
        color: PDF_CONFIG.colors.background.lightGray,
        borderColor: PDF_CONFIG.colors.primary,
        borderWidth: 0.5
      });
      
      this.drawText(editableText, editableX, footerY - 18, {
        size: PDF_CONFIG.fonts.footer.size,
        color: PDF_CONFIG.colors.primary,
        font: this.boldFont!
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
