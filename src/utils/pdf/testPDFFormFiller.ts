/**
 * Test script for PDF Form Filler
 * 
 * This script can be run in the browser console to test the PDF form filling functionality
 */

import { PDFFormFiller, analyzePDFTemplate } from './pdfFormFiller';
import type { Family } from '../../types/forms';

// Sample family data for testing
const testFamily: Family = {
  id: 'family-test',
  students: [
    {
      id: 'student-test',
      firstName: 'Jean',
      lastName: 'Dupont',
      birthDate: new Date('2015-03-15'),
      grade: 'CE2',
      school: 'École Primaire Victor Hugo'
    }
  ],
  parents: [
    {
      id: 'parent-1',
      type: 'father',
      firstName: 'Pierre',
      lastName: 'Dupont',
      email: 'pierre.dupont@email.com',
      phone: '0123456789',
      profession: 'Ingénieur'
    }
  ],
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France'
  },
  emergencyContacts: [],
  preferences: {
    language: 'fr',
    notifications: true,
    autoSave: true,
    theme: 'light'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Test function
export async function testPDFFormFiller(): Promise<void> {
  try {
    console.log('Testing PDF Form Filler...');
    
    console.log('Analyzing periscolaire template...');
    const fields = await analyzePDFTemplate('periscolaire');
    console.log('Found fields:', fields);
    
    console.log('Creating PDF form filler...');
    const filler = new PDFFormFiller();
    
    console.log('Generating filled PDF...');
    const pdfBytes = await filler.generateFilledPDF('periscolaire', testFamily);
    
    console.log('PDF generated successfully! Size:', pdfBytes.length, 'bytes');
    
    // Create download link
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test_filled_form.pdf';
    link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Extended window interface for testing
declare global {
  interface Window {
    testPDFFormFiller?: () => Promise<void>;
  }
}

// Auto-run when this script is loaded in browser
if (typeof window !== 'undefined') {
  window.testPDFFormFiller = testPDFFormFiller;
  console.log('PDF Form Filler test function loaded. Run testPDFFormFiller() to test.');
}

export { testFamily };
