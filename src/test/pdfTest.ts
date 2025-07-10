// Test script to verify PDF generation works
import { PDFGenerator, createFieldMappingsFromFamily, createCoordinateMappingsFromFamily } from '../utils/pdf';
import type { Family } from '../types/forms';

// Test data
const testFamily: Family = {
  id: 'test-family',
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France'
  },
  students: [],
  parents: [],
  emergencyContacts: [],
  preferences: {
    notifications: true,
    language: 'fr',
    theme: 'auto',
    autoSave: true,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function testPDFGeneration() {
  console.log('Testing PDF generation...');
  
  try {
    const pdfGenerator = new PDFGenerator();
    
    // Load template
    await pdfGenerator.loadTemplate('PERISCOLAIRE – 2025-2026 - Fiche d\'inscription (1).pdf');
    
    // Get form fields
    const formFields = pdfGenerator.getFormFields();
    console.log('PDF form fields:', formFields);
    
    // Create mappings
    const fieldMappings = createFieldMappingsFromFamily(testFamily);
    const coordinateMappings = createCoordinateMappingsFromFamily(testFamily);
    
    console.log('Field mappings:', fieldMappings);
    console.log('Coordinate mappings:', coordinateMappings);
    
    // Fill form
    pdfGenerator.fillFormFields(fieldMappings);
    await pdfGenerator.addTextAtCoordinates(coordinateMappings);
    
    // Generate PDF
    const blob = await pdfGenerator.generatePDF();
    console.log('PDF generated successfully, size:', blob.size);
    
    return true;
  } catch (error) {
    console.error('PDF generation test failed:', error);
    return false;
  }
}

// Add to window for testing in browser console
if (typeof window !== 'undefined') {
  (window as Window & { testPDFGeneration?: () => Promise<boolean> }).testPDFGeneration = testPDFGeneration;
}
