# Clean PDF Generation System

This document describes the new clean PDF generation system that replaces the old coordinate-based approach.

## 🎯 Overview

The new system generates PDFs completely from scratch using predefined templates, eliminating the need for:
- Coordinate positioning and calibration
- Overlay on existing PDF templates  
- Complex coordinate adjustment scripts
- Manual field positioning

## 🏗️ Architecture

### Core Components

1. **Form Templates** (`formTemplates.ts`)
   - Define form structure and fields
   - Extract data from family objects
   - Type-safe field definitions

2. **PDF Generator** (`pdfGenerator.ts`)
   - Renders PDFs from templates
   - Handles styling and layout
   - Manages page breaks and spacing

3. **Template Registry**
   - Centralized template management
   - Easy template discovery
   - Extensible architecture

## 📋 Available Templates

### Périscolaire Template
- **ID**: `periscolaire`
- **Purpose**: After-school activities registration
- **Sections**: Child info, address, parents, emergency contact, activities

### EDPP Template  
- **ID**: `edpp`
- **Purpose**: ALSH EDPP registration
- **Sections**: Child info, address, father info, mother info

## 🚀 Usage

### Basic PDF Generation

```typescript
import { generateAndDownloadPDF, PERISCOLAIRE_TEMPLATE } from '../utils/pdf';
import type { Family } from '../types/forms';

// Generate editable PDF (default)
await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, family);

// Generate static PDF
await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, family, { 
  editable: false 
});

// Preview PDF in new tab
await previewPDF(PERISCOLAIRE_TEMPLATE, family, {
  editable: true
});

// Custom options
await generateAndDownloadPDF(PERISCOLAIRE_TEMPLATE, family, {
  editable: true,
  filename: 'mon-formulaire.pdf',
  showEditableNotice: true
});
```

### PDF Generation Options

```typescript
interface PDFGenerationOptions {
  editable?: boolean;           // Create editable form fields (default: true)
  filename?: string;            // Custom filename for download
  showEditableNotice?: boolean; // Show editable notice in footer (default: true)
}
```

### In React Components

```tsx
import React from 'react';
import { Button, Switch } from '@mantine/core';
import { generateAndDownloadPDF, getTemplate } from '../utils/pdf';

export const PDFGeneratorComponent = ({ family }) => {
  const [isEditable, setIsEditable] = React.useState(true);
  
  const handleGeneratePDF = async (templateId: string) => {
    const template = getTemplate(templateId);
    if (template) {
      await generateAndDownloadPDF(template, family, {
        editable: isEditable,
        filename: `${template.name}_${new Date().toISOString().split('T')[0]}.pdf`
      });
    }
  };

  return (
    <>
      <Switch
        label="Formulaire éditable"
        checked={isEditable}
        onChange={(e) => setIsEditable(e.currentTarget.checked)}
      />
      <Button onClick={() => handleGeneratePDF('periscolaire')}>
        Generate {isEditable ? 'Editable' : 'Static'} PDF
      </Button>
    </>
  );
};
```

## 🔧 Adding New Templates

### 1. Define Template Structure

```typescript
export const MY_TEMPLATE: FormTemplate = {
  id: 'my-form',
  name: 'My Custom Form',
  title: 'MY CUSTOM FORM TITLE',
  description: 'Description of the form',
  
  sections: [
    {
      id: 'section1',
      title: 'SECTION TITLE',
      fields: [
        {
          id: 'field1',
          label: 'Field Label',
          type: 'text',
          required: true,
          maxLength: 50
        }
      ]
    }
  ],
  
  extractData: (family: Family) => ({
    field1: family.students[0]?.firstName || ''
  })
};
```

### 2. Register Template

```typescript
// Add to FORM_TEMPLATES in formTemplates.ts
export const FORM_TEMPLATES: Record<string, FormTemplate> = {
  periscolaire: PERISCOLAIRE_TEMPLATE,
  edpp: EDPP_TEMPLATE,
  'my-form': MY_TEMPLATE  // Add your template
};
```

## 📝 Editable PDF Forms

### How It Works

The system generates PDFs with **interactive form fields** that can be filled and modified directly in PDF viewers:

- **Text Fields**: Single and multi-line text inputs
- **Dropdowns**: Selection from predefined options  
- **Checkboxes**: Boolean yes/no values
- **Date Fields**: Date pickers (in compatible viewers)

### Field Types Mapping

| Template Field Type | PDF Form Element | User Experience |
|-------------------|-----------------|-----------------|
| `text` | Text Field | Editable text input |
| `textarea` | Multi-line Text Field | Expandable text area |
| `email` | Text Field | Email input with validation |
| `phone` | Text Field | Phone number input |
| `date` | Text Field | Date input |
| `select` | Dropdown | Selectable options |
| `checkbox` | Checkbox | Clickable checkbox |

### Benefits for Users

1. **Flexible Completion**: Fill forms digitally or print and complete by hand
2. **Easy Corrections**: Modify values without regenerating PDFs
3. **Digital Signatures**: Add signatures in compatible PDF editors
4. **Form Validation**: Some PDF viewers provide field validation
5. **Accessibility**: Better screen reader support with form fields

### Compatibility

✅ **Works with:**
- Adobe Acrobat Reader
- Chrome PDF Viewer  
- Firefox PDF Viewer
- Safari PDF Viewer
- Most modern PDF applications

✅ **Mobile Support:**
- iOS Safari
- Android Chrome
- Adobe Acrobat Mobile

## 🎨 Styling Configuration

PDF styling is configured in `PDF_CONFIG`:

```typescript
const PDF_CONFIG = {
  pageSize: { width: 595, height: 842 }, // A4
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
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
  }
};
```

## 📊 Field Types

Supported field types:

- `text`: Single-line text input
- `textarea`: Multi-line text input  
- `email`: Email validation
- `phone`: Phone number
- `date`: Date picker
- `select`: Dropdown selection
- `checkbox`: Boolean checkbox

## ✅ Benefits

### Eliminated Issues
- ❌ No more coordinate positioning problems
- ❌ No more PDF template dependencies
- ❌ No more calibration scripts
- ❌ No more overlay positioning

### New Advantages  
- ✅ Clean, professional PDF output
- ✅ **Editable PDF forms** - Users can modify fields after generation
- ✅ Consistent styling and layout
- ✅ Easy template creation and modification
- ✅ Type-safe field definitions
- ✅ Automatic data validation
- ✅ Responsive field layout
- ✅ Built-in pagination
- ✅ **Form field types**: text, dropdown, checkbox, textarea
- ✅ **Preview functionality** before download

## 🔄 Migration from Old System

### Removed Files
- `coordinateAdjuster.ts`
- `coordinateAnalyzer.ts` 
- `coordinateCalibrator.ts`
- `calibrationSync.ts`
- `coordinateSystem.ts`
- `pdfGenerator.ts` (old)
- `pdfGeneratorNew.ts`
- `templates.ts` (old)
- All calibration HTML test files

### Updated Components
- `TemplateSelect.tsx`: Now uses new template system
- `FamilyForm.tsx`: Removed calibration button
- PDF utilities index: Exports new clean system

## 🛠️ Development

### Adding Features

1. **New Field Types**: Add to `FieldType` union and handle in renderer
2. **Custom Styling**: Modify `PDF_CONFIG` constants
3. **Multi-page Forms**: Automatic page breaks are handled
4. **Validation**: Add field validation rules

### Testing

```bash
# Type checking
npm run type-check

# Build
npm run build

# Test PDF generation
npm run dev
# Navigate to form completion and test PDF generation
```

## 📝 Example Data Flow

1. **User Input** → Form components collect family data
2. **Template Selection** → User chooses form template  
3. **Data Extraction** → Template extracts relevant fields
4. **PDF Generation** → Clean PDF built from scratch
5. **Download/Preview** → User gets professional PDF

This new system provides a much cleaner, more maintainable approach to PDF generation while delivering better results for end users.
