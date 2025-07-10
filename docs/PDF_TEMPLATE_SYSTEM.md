# PDF Template System Documentation

## Overview

The new PDF template system provides a scalable and maintainable way to manage PDF form generation across different school forms. Each PDF template has its own configuration with coordinates and field mappings.

## Architecture

### Core Components

1. **PDFTemplate Interface**: Defines the structure for each template
2. **PDFFieldCoordinate**: Specifies positioning and styling for each field
3. **PDFFieldMapping**: Maps family data to PDF field coordinates
4. **PDFGenerator**: Handles PDF loading, generation, and downloading
5. **TemplateSelect**: UI component for selecting and generating PDFs

### Template Configuration

Each template configuration includes:
- **id**: Unique identifier for the template
- **name**: Human-readable name
- **fileName**: PDF file name in the public/templates/ folder
- **description**: Description of the form
- **fields**: Coordinate mappings for each field
- **getFieldMappings**: Function to map family data to PDF fields

## Available Templates

### 1. ALSH EDPP 2025-2026 (Fully Implemented)
- **ID**: `alsh-edpp-2025-2026`
- **File**: `Dossier d'inscription ALSH - EDPP 2025-2026.pdf`
- **Status**: ✅ Fully implemented with calibrated coordinates
- **Sections**: Child info, address, father info, mother info, emergency contact, medical info

### 2. Périscolaire 2025-2026 (Template Only)
- **ID**: `periscolaire-2025-2026`
- **File**: `PERISCOLAIRE – 2025-2026 - Fiche d'inscription (1).pdf`
- **Status**: ⏳ Template structure ready, coordinates need calibration
- **Action Required**: Implement getFieldMappings function

### 3. EDPP Contract 2025-2026 (Template Only)
- **ID**: `edpp-contract-2025-2026`
- **File**: `EDPP Contrat d'engagement 2025-2026.pdf`
- **Status**: ⏳ Template structure ready, coordinates need calibration
- **Action Required**: Implement getFieldMappings function

### 4. EDPP Wednesday & Holidays 2025-2026 (Template Only)
- **ID**: `edpp-wednesday-2025-2026`
- **File**: `Fiche d'inscription EDPP - Mercredis Vacs sco 25-26.pdf`
- **Status**: ⏳ Template structure ready, coordinates need calibration
- **Action Required**: Implement getFieldMappings function

## Usage

### Using the TemplateSelect Component

```tsx
import { TemplateSelect } from '../components/pdf/TemplateSelect';

// Inside your component
<TemplateSelect 
  family={familyData} 
  onPDFGenerated={(templateId) => {
    console.log(`PDF generated for template: ${templateId}`);
  }}
/>
```

### Using the PDFGenerator Directly

```tsx
import { PDFGenerator } from '../utils/pdf/pdfGeneratorNew';

const generator = new PDFGenerator();
await generator.generateAndDownloadPDF(familyData, 'alsh-edpp-2025-2026');
```

### Getting Available Templates

```tsx
import { getAllTemplates, getTemplate } from '../utils/pdf/templates';

// Get all templates
const templates = getAllTemplates();

// Get specific template
const alshTemplate = getTemplate('alsh-edpp-2025-2026');
```

## Adding New Templates

To add a new template:

1. **Add the PDF file** to `public/templates/`
2. **Create template configuration** in `src/utils/pdf/templates.ts`
3. **Implement coordinate mapping** in the `getFieldMappings` function
4. **Add to template registry** in the `PDF_TEMPLATES` object

### Example Template Configuration

```typescript
export const NEW_TEMPLATE: PDFTemplate = {
  id: 'new-template-2025',
  name: 'New Template 2025',
  fileName: 'new-template-2025.pdf',
  description: 'Description of the new template',
  
  fields: {
    'child.firstName': { x: 100, y: 700, fontSize: 10 },
    'child.lastName': { x: 300, y: 700, fontSize: 10 },
    'address.street': { x: 100, y: 650, fontSize: 9 },
    // ... more field coordinates
  },

  getFieldMappings: (family: Family) => {
    const mappings: Record<string, PDFFieldMapping> = {};
    
    // Map family data to PDF coordinates
    mappings['child.firstName'] = {
      value: family.students?.[0]?.firstName || '',
      coordinate: NEW_TEMPLATE.fields['child.firstName']
    };
    
    // ... more mappings
    
    return mappings;
  }
};
```

## Coordinate System

- **Origin**: Bottom-left corner of the PDF page (0, 0)
- **X-axis**: Increases from left to right
- **Y-axis**: Increases from bottom to top
- **Units**: Points (1 point = 1/72 inch)

## Calibrating Coordinates

To calibrate coordinates for a new template:

1. **Analyze the PDF** structure and identify field positions
2. **Start with rough estimates** based on visual inspection
3. **Test and iterate** by generating PDFs and adjusting coordinates
4. **Document field positions** in the template configuration
5. **Validate with actual data** to ensure proper alignment

## Best Practices

1. **Group related fields** by section for better organization
2. **Use consistent naming** for similar fields across templates
3. **Test with various data lengths** to ensure fields don't overlap
4. **Document coordinate decisions** for future maintenance
5. **Use appropriate font sizes** based on available space

## File Structure

```
src/
├── components/
│   └── pdf/
│       └── TemplateSelect.tsx          # UI component for template selection
├── utils/
│   └── pdf/
│       ├── index.ts                    # Main exports
│       ├── templates.ts                # Template configurations
│       ├── pdfGeneratorNew.ts          # New template-based generator
│       └── pdfGenerator.ts             # Legacy generator (kept for compatibility)
└── ...
```

## Migration from Legacy System

The old coordinate mapping functions are still available for backward compatibility:
- `createFieldMappingsFromFamily()` - Legacy field mapping
- `createCoordinateMappingsFromFamily()` - Legacy coordinate mapping

New implementations should use the template system:
- `generateFieldMappingsForTemplate()` - Template-based field mapping
- `PDFGenerator.generateAndDownloadPDF()` - Template-based PDF generation

## Next Steps

1. **Implement remaining templates** (Périscolaire, EDPP Contract, EDPP Wednesday)
2. **Add checkbox/radio button support** for form fields
3. **Implement multi-child support** for families with multiple children
4. **Add template validation** to ensure coordinates are within page bounds
5. **Create coordinate calibration tool** for easier template setup
