# PDF Form Filler System

## Overview

The PDF Form Filler system uses existing PDF templates with pre-defined form fields and maps application data directly to those fields. This approach preserves the exact visual appearance and layout of official forms while eliminating the need for manual positioning.

## Key Benefits

- **Exact Appearance**: Uses original PDF templates maintaining official look and feel
- **No Positioning Required**: Maps data to existing form fields instead of calculating coordinates
- **Maintainable**: Field mappings are centralized in configuration files
- **Extensible**: Easy to add new templates by adding configuration

## Architecture

### Core Components

1. **PDFFormFiller**: Main class that loads PDFs and fills form fields
2. **Template Mappings**: Configuration files that map app data to PDF field names
3. **Field Extractors**: Functions that extract data from Family objects
4. **Template Configs**: Configuration for each PDF template

### File Structure

```
src/utils/pdf/
├── index.ts                    # Main exports
├── pdfFormFiller.ts           # Core PDF filling logic
└── templateMappings.ts        # Template configurations and field mappings
```

## Usage

### Basic PDF Generation

```typescript
import { generateAndDownloadPDF } from '../../utils/pdf';

// Generate and download a filled PDF
await generateAndDownloadPDF(
  'test-periscolaire',  // Template ID
  family,               // Family data
  'inscription.pdf'     // Optional filename
);
```

### Preview PDF

```typescript
import { previewPDF } from '../../utils/pdf';

// Open PDF preview in new tab
await previewPDF('test-periscolaire', family);
```

### Programmatic PDF Generation

```typescript
import { PDFFormFiller } from '../../utils/pdf';

const filler = new PDFFormFiller();
const pdfBytes = await filler.generateFilledPDF('test-periscolaire', family);

// Use pdfBytes as needed (save, send, etc.)
```

## Adding New Templates

### Step 1: Add PDF Template

1. Place the PDF file in `/public/templates/`
2. Use a simple filename without special characters (e.g., `new-template.pdf`)

### Step 2: Create Field Mapping Configuration

Add to `src/utils/pdf/templateMappings.ts`:

```typescript
const NEW_TEMPLATE_CONFIG: TemplateConfig = {
  id: 'new-template',
  name: 'New Template Form',
  description: 'Description of the form',
  templatePath: '/templates/new-template.pdf',
  fields: [
    {
      pdfFieldName: 'student_name',  // Actual field name in PDF
      fieldType: 'text',
      getValue: extractors.studentFullName,
      required: true
    },
    {
      pdfFieldName: 'parent_email',
      fieldType: 'text', 
      getValue: extractors.parentEmail,
      required: true
    },
    // Add more field mappings...
  ]
};

// Add to TEMPLATE_CONFIGS
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  // ...existing configs...
  'new-template': NEW_TEMPLATE_CONFIG,
};
```

### Step 3: Test the Template

Use the debug tools to verify field mappings:

```typescript
import { analyzePDFTemplate, testTemplateAccessibility } from '../../utils/pdf';

// Check if template is accessible
const status = await testTemplateAccessibility('new-template');
console.log(status);

// Analyze PDF form fields
const fields = await analyzePDFTemplate('new-template');
console.log('Available fields:', fields);
```

## Field Extractors

Pre-defined extractors are available for common data:

```typescript
const extractors = {
  // Student data
  studentFullName: (data: Family) => `${data.students[0]?.firstName} ${data.students[0]?.lastName}`,
  studentFirstName: (data: Family) => data.students[0]?.firstName || '',
  studentLastName: (data: Family) => data.students[0]?.lastName || '',
  studentBirthDate: (data: Family) => data.students[0]?.birthDate?.toLocaleDateString('fr-FR') || '',
  
  // Parent data
  parentFullName: (data: Family) => `${data.parents[0]?.firstName} ${data.parents[0]?.lastName}`,
  parentEmail: (data: Family) => data.parents[0]?.email || '',
  parentPhone: (data: Family) => data.parents[0]?.phone || '',
  
  // Address data
  fullAddress: (data: Family) => {
    const addr = data.address;
    return addr ? `${addr.street}, ${addr.postalCode} ${addr.city}` : '';
  },
  
  // Custom extractors
  customData: (data: Family) => {
    // Custom logic here
    return 'custom value';
  }
};
```

## Field Types

Supported PDF field types:

- **text**: Text input fields
- **checkbox**: Checkboxes (boolean values)
- **radio**: Radio button groups
- **dropdown**: Select/dropdown fields

## Template Configuration

### TemplateConfig Interface

```typescript
interface TemplateConfig {
  id: string;              // Unique template identifier
  name: string;            // Display name
  description: string;     // Template description
  templatePath: string;    // Path to PDF file in public folder
  fields: PDFFieldMapping[]; // Field mappings
}
```

### PDFFieldMapping Interface

```typescript
interface PDFFieldMapping {
  pdfFieldName: string;    // Exact field name in PDF
  fieldType: 'text' | 'checkbox' | 'radio' | 'dropdown';
  getValue: (data: Family) => string | boolean | number;
  required?: boolean;      // Whether field is required
  defaultValue?: string | boolean | number; // Default if no data
}
```

## Debugging Tools

### Template Accessibility Test

```typescript
const result = await testTemplateAccessibility('template-id');
console.log({
  accessible: result.accessible,
  isPDF: result.isPDF,
  size: result.size,
  error: result.error
});
```

### PDF Field Analysis

```typescript
const fields = await analyzePDFTemplate('template-id');
fields.forEach(field => {
  console.log(`Field: ${field} (Type: ${field.split(' ')[1]})`);
});
```

## Error Handling

The system includes comprehensive error handling:

- **Template Loading**: Validates PDF accessibility and format
- **Field Mapping**: Handles missing or incorrect field names
- **Data Extraction**: Provides fallback values for missing data
- **PDF Generation**: Graceful degradation on field filling errors

## Performance Considerations

- Templates are loaded on-demand
- PDF processing is done client-side using pdf-lib
- No server round-trips required
- Memory usage is optimized for typical form sizes

## Security

- All processing happens client-side
- No sensitive data transmitted to servers
- PDF templates are static assets
- Input validation on all extracted data

## Browser Compatibility

- Modern browsers with pdf-lib support
- Chrome, Firefox, Safari, Edge (latest versions)
- No Internet Explorer support

## Future Enhancements

- Batch processing multiple forms
- Template versioning system
- Advanced field validation
- Custom field type support
- Integration with cloud storage

## Troubleshooting

### Common Issues

1. **Template not found**: Check file path and accessibility
2. **Field not filled**: Verify PDF field name matches configuration
3. **Data missing**: Check extractor function logic
4. **PDF corrupted**: Validate original PDF has form fields

### Debug Steps

1. Use `testTemplateAccessibility()` to verify template access
2. Use `analyzePDFTemplate()` to list available fields
3. Check browser console for detailed error messages
4. Verify Family data structure matches extractors

## Migration from Legacy System

The new form filler system replaces the old coordinate-based PDF generation:

### Before (Legacy)
```typescript
// Old system - coordinate positioning
await generateAndDownloadPDF(template, family, { editable: true });
```

### After (New System)
```typescript
// New system - form field mapping
await generateAndDownloadPDF('template-id', family, 'filename.pdf');
```

### Benefits of Migration
- No coordinate calculations needed
- Uses official PDF templates
- Maintains exact visual appearance
- Easier to maintain and extend
