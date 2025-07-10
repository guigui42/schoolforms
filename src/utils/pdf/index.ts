// Export new template-based PDF generator
export { PDFGenerator } from './pdfGeneratorNew';
export { 
  getAllTemplates, 
  getTemplate, 
  getTemplateByFilename, 
  generateFieldMappingsForTemplate,
  ALSH_EDPP_TEMPLATE,
  PERISCOLAIRE_TEMPLATE,
  EDPP_CONTRACT_TEMPLATE,
  EDPP_WEDNESDAY_TEMPLATE,
  PDF_TEMPLATES,
  type PDFTemplate,
  type PDFFieldMapping,
  type PDFFieldCoordinate
} from './templates';

// Legacy exports for backward compatibility
export { 
  PDFGenerator as LegacyPDFGenerator,
  createFieldMappingsFromFamily,
  createCoordinateMappingsFromFamily 
} from './pdfGenerator';
