/**
 * Example: How to use the new PDF Generation System
 * 
 * This example shows how to use the new clean PDF generation system
 * that builds forms from scratch instead of overlaying on existing PDFs.
 */

import { 
  PERISCOLAIRE_TEMPLATE, 
  EDPP_TEMPLATE, 
  generateAndDownloadPDF, 
  previewPDF 
} from '../src/utils/pdf';

import type { Family } from '../src/types/forms';

// Example family data
const exampleFamily: Family = {
  id: 'family-123',
  
  students: [{
    id: 'student-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    birthDate: new Date('2015-03-15'),
    grade: 'CE2',
    school: 'École Élémentaire Victor Hugo',
    medicalInfo: {
      allergies: ['Arachides'],
      notes: 'Aucune autre information médicale'
    }
  }],
  
  parents: [
    {
      id: 'parent-1',
      type: 'mother',
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@email.com',
      phone: '06.12.34.56.78',
      profession: 'Infirmière'
    },
    {
      id: 'parent-2', 
      type: 'father',
      firstName: 'Pierre',
      lastName: 'Dupont',
      email: 'pierre.dupont@email.com',
      phone: '06.87.65.43.21',
      profession: 'Ingénieur'
    }
  ],
  
  address: {
    street: '123 Rue de la République',
    city: 'Lyon',
    postalCode: '69000',
    country: 'France'
  },
  
  emergencyContacts: [{
    id: 'emergency-1',
    firstName: 'Sophie',
    lastName: 'Martin',
    relationship: 'Grand-mère',
    phone: '04.78.12.34.56',
    email: 'sophie.martin@email.com'
  }],
  
  preferences: {
    language: 'fr',
    notifications: true,
    autoSave: true,
    theme: 'auto'
  },
  
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example usage functions

/**
 * Generate a PDF for the périscolaire form
 */
export async function generatePeriscolairePDF() {
  try {
    console.log('Generating Périscolaire PDF...');
    await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, exampleFamily, 'inscription-periscolaire.pdf');
    console.log('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

/**
 * Generate a PDF for the EDPP form
 */
export async function generateEDPPPDF() {
  try {
    console.log('Generating EDPP PDF...');
    await generateAndDownloadPDF(EDPP_TEMPLATE, exampleFamily, 'inscription-edpp.pdf');
    console.log('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

/**
 * Preview a PDF in a new browser tab
 */
export async function previewPeriscolairePDF() {
  try {
    console.log('Previewing Périscolaire PDF...');
    await previewPDF(PERISCOLAIRE_TEMPLATE, exampleFamily);
    console.log('PDF preview opened!');
  } catch (error) {
    console.error('Error previewing PDF:', error);
  }
}

/**
 * Example of how to extract data from family object
 */
export function demonstrateDataExtraction() {
  console.log('--- PERISCOLAIRE Data Extraction ---');
  const periscolaireData = PERISCOLAIRE_TEMPLATE.extractData(exampleFamily);
  console.log(periscolaireData);
  
  console.log('--- EDPP Data Extraction ---');
  const edppData = EDPP_TEMPLATE.extractData(exampleFamily);
  console.log(edppData);
}

/**
 * Example of how to add a new custom template
 */
export const CUSTOM_TEMPLATE = {
  id: 'custom-form',
  name: 'Formulaire Personnalisé',
  title: 'FORMULAIRE PERSONNALISÉ',
  description: 'Un exemple de formulaire personnalisé',
  
  sections: [
    {
      id: 'basic_info',
      title: 'INFORMATIONS DE BASE',
      fields: [
        {
          id: 'student_name',
          label: 'Nom complet de l\'élève',
          type: 'text' as const,
          required: true
        },
        {
          id: 'contact_email',
          label: 'Email de contact',
          type: 'email' as const,
          required: true
        }
      ]
    }
  ],
  
  extractData: (family) => ({
    student_name: `${family.students[0]?.firstName || ''} ${family.students[0]?.lastName || ''}`.trim(),
    contact_email: family.parents[0]?.email || ''
  })
};

// How to use in a React component:
/*
import React from 'react';
import { Button } from '@mantine/core';
import { generateAndDownloadPDF, PERISCOLAIRE_TEMPLATE } from '../utils/pdf';

export const MyComponent = () => {
  const handleGeneratePDF = async () => {
    // Get family data from your form state
    const family = getFamilyDataFromForm();
    
    // Generate and download PDF
    await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, family);
  };
  
  return (
    <Button onClick={handleGeneratePDF}>
      Générer PDF Périscolaire
    </Button>
  );
};
*/

console.log(`
🎉 New PDF Generation System Ready!

Key features:
✅ No more coordinate positioning issues
✅ Clean template-based approach  
✅ Built-in form validation
✅ Professional PDF styling
✅ Easy to extend with new templates
✅ TypeScript support

Available templates:
- PERISCOLAIRE_TEMPLATE: For périscolaire forms
- EDPP_TEMPLATE: For EDPP/ALSH forms

Usage:
1. Import the template and functions
2. Provide family data
3. Call generateAndDownloadPDF() or previewPDF()

The system automatically:
- Extracts relevant data from family object
- Renders clean, professional forms
- Handles field validation and formatting
- Generates downloadable PDFs
`);
