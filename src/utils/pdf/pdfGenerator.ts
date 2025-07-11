/**
 * Clean PDF Generator
 * 
 * This module generates PDFs completely from scratch based on form templates,
 * eliminating the need for coordinate positioning and template overlays.
 */

import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from 'pdf-lib';
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

export class PDFGenerator {
  private pdfDoc: PDFDocument | null = null;
  private currentPage: PDFPage | null = null;
  private font: PDFFont | null = null;
  private boldFont: PDFFont | null = null;
  private currentY: number = 0;

  async initialize(): Promise<void> {
    this.pdfDoc = await PDFDocument.create();
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.boldFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
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
    
    // Draw field box
    this.drawFieldBox(x, this.currentY, fieldWidth, PDF_CONFIG.field.height);
    
    // Draw value
    let displayValue = '';
    if (typeof value === 'boolean') {
      displayValue = field.type === 'checkbox' ? (value ? '☑' : '☐') : (value ? 'Oui' : 'Non');
    } else {
      displayValue = String(value || '');
    }
    
    if (displayValue) {
      this.drawText(displayValue, x + 5, this.currentY - 6, {
        size: PDF_CONFIG.fonts.value.size,
        color: PDF_CONFIG.fonts.value.color,
        maxWidth: fieldWidth - 10
      });
    }
    
    if (!isLeftColumn) {
      this.currentY -= PDF_CONFIG.field.height + PDF_CONFIG.spacing.fieldGap;
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

  async generatePDF(template: FormTemplate, family: Family): Promise<Uint8Array> {
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
    
    const footerY = PDF_CONFIG.margins.bottom - 20;
    const footerText = `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    const textWidth = this.font.widthOfTextAtSize(footerText, 8);
    const x = (PDF_CONFIG.pageSize.width - textWidth) / 2;
    
    this.drawText(footerText, x, footerY, {
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    });
  }
}

// Helper function to generate and download PDF
export async function generateAndDownloadPDF(
  template: FormTemplate, 
  family: Family, 
  filename?: string
): Promise<void> {
  const generator = new PDFGenerator();
  const pdfBytes = await generator.generatePDF(template, family);
  
  // Create blob and download
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${template.name}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Helper function to preview PDF in new tab
export async function previewPDF(template: FormTemplate, family: Family): Promise<void> {
  const generator = new PDFGenerator();
  const pdfBytes = await generator.generatePDF(template, family);
  
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  window.open(url, '_blank');
  
  // Clean up URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
