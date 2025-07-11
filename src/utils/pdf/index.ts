/**
 * PDF Generation System
 * 
 * Uses existing PDF templates with form fields and maps values directly.
 * This approach preserves the exact visual appearance of official forms.
 */

export {
  PDFFormFiller,
  generateAndDownloadFilledPDF as generateAndDownloadPDF,
  previewFilledPDF as previewPDF,
  analyzePDFTemplate,
  testTemplateAccessibility,
  TEMPLATE_MAPPINGS,
  extractTemplateData,
  type TemplateConfig,
  type PDFFieldMapping
} from './pdfFormFiller';
