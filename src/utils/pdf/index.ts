/**
 * PDF Generation System
 * 
 * Clean template-based PDF generation that builds forms from scratch
 * instead of overlaying on existing PDFs.
 */

// Form templates
export { 
  getTemplate,
  getAllTemplates,
  getTemplateIds,
  PERISCOLAIRE_TEMPLATE,
  EDPP_TEMPLATE,
  FORM_TEMPLATES,
  type FormTemplate,
  type FormSection,
  type FormField,
  type FieldType
} from './formTemplates';

// PDF generator
export { 
  PDFGenerator,
  generateAndDownloadPDF,
  previewPDF
} from './pdfGenerator';
