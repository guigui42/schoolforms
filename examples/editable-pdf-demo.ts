/**
 * Editable PDF Demo
 * 
 * This example demonstrates the new editable PDF functionality
 */

import { 
  PERISCOLAIRE_TEMPLATE, 
  EDPP_TEMPLATE, 
  generateAndDownloadPDF, 
  previewPDF,
  type PDFGenerationOptions 
} from '../src/utils/pdf';

import type { Family } from '../src/types/forms';

// Demo family data
const demoFamily: Family = {
  id: 'demo-family',
  
  students: [{
    id: 'student-demo',
    firstName: 'Emma',
    lastName: 'Martin',
    birthDate: new Date('2016-09-12'),
    grade: 'CE1',
    school: 'École Primaire Les Tilleuls'
  }],
  
  parents: [
    {
      id: 'mother-demo',
      type: 'mother',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@example.com',
      phone: '06.12.34.56.78',
      profession: 'Architecte'
    },
    {
      id: 'father-demo', 
      type: 'father',
      firstName: 'Thomas',
      lastName: 'Martin',
      email: 'thomas.martin@example.com',
      phone: '06.87.65.43.21',
      profession: 'Développeur'
    }
  ],
  
  address: {
    street: '15 Avenue des Champs',
    city: 'Marseille',
    postalCode: '13000',
    country: 'France'
  },
  
  emergencyContacts: [{
    id: 'grand-mother',
    firstName: 'Marie',
    lastName: 'Dupont',
    relationship: 'Grand-mère',
    phone: '04.91.12.34.56'
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

/**
 * Demo 1: Generate Editable Périscolaire PDF
 */
export async function demoEditablePeriscolaire() {
  console.log('🔥 Generating Editable Périscolaire PDF...');
  
  const options: PDFGenerationOptions = {
    editable: true,
    filename: 'periscolaire-editable-demo.pdf',
    showEditableNotice: true
  };
  
  await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, demoFamily, options);
  
  console.log('✅ Editable PDF generated! Try opening it and editing the fields.');
}

/**
 * Demo 2: Generate Static EDPP PDF (for comparison)
 */
export async function demoStaticEDPP() {
  console.log('📄 Generating Static EDPP PDF...');
  
  const options: PDFGenerationOptions = {
    editable: false,
    filename: 'edpp-static-demo.pdf',
    showEditableNotice: false
  };
  
  await generateAndDownloadPDF(EDPP_TEMPLATE, demoFamily, options);
  
  console.log('✅ Static PDF generated! This one has fixed text, not editable.');
}

/**
 * Demo 3: Preview Both Types
 */
export async function demoPreviewComparison() {
  console.log('👀 Opening Preview Windows...');
  
  // Preview editable version
  setTimeout(async () => {
    await previewPDF(PERISCOLAIRE_TEMPLATE, demoFamily, { 
      editable: true 
    });
    console.log('✅ Editable preview opened');
  }, 500);
  
  // Preview static version
  setTimeout(async () => {
    await previewPDF(PERISCOLAIRE_TEMPLATE, demoFamily, { 
      editable: false 
    });
    console.log('✅ Static preview opened');
  }, 1500);
  
  console.log('Compare the two versions - one has editable fields, one doesn\'t!');
}

/**
 * Demo 4: Show Field Types in Action
 */
export async function demoFieldTypes() {
  console.log('🎛️ Demonstrating Different Field Types...');
  
  // Modify family data to show different field types
  const enhancedFamily: Family = {
    ...demoFamily,
    students: [{
      ...demoFamily.students[0],
      // This will create different field types in the PDF
    }]
  };
  
  await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, enhancedFamily, {
    editable: true,
    filename: 'field-types-demo.pdf'
  });
  
  console.log(`
✅ PDF with various field types generated!

In the PDF you'll find:
📝 Text Fields: Names, addresses, professions
📋 Dropdowns: Grade selection
☑️ Checkboxes: Activity selections
📄 Text Areas: Additional information

Try interacting with each type of field!
  `);
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log(`
🎯 Editable PDF System Demo
============================

This demo shows the new editable PDF functionality.
We'll generate several PDFs to showcase the features.
  `);
  
  // Run demos with delays
  await demoEditablePeriscolaire();
  
  setTimeout(async () => {
    await demoStaticEDPP();
  }, 2000);
  
  setTimeout(async () => {
    await demoFieldTypes();
  }, 4000);
  
  setTimeout(async () => {
    await demoPreviewComparison();
  }, 6000);
  
  setTimeout(() => {
    console.log(`
🎉 Demo Complete!

What you should see:
1. Downloaded editable PDFs you can modify
2. Downloaded static PDFs with fixed text  
3. Preview windows showing both types
4. Different field types working correctly

✨ The editable PDFs can be:
- Filled out digitally in any PDF viewer
- Printed and filled by hand
- Shared with others to complete
- Modified multiple times

🚀 This eliminates the need for coordinate positioning
   and provides a much better user experience!
    `);
  }, 8000);
}

// Auto-run demo if this file is imported
if (typeof window !== 'undefined') {
  console.log('📋 Editable PDF Demo Ready! Call runAllDemos() to start.');
}
