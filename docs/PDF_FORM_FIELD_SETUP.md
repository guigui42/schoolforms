# PDF Template Form Field Setup Guide

## Overview

This guide explains how to add form fields to PDF templates manually for use with our PDF form filling system.

## Required Tools

### Free Options
1. **LibreOffice Draw** - Free, cross-platform
2. **PDFtk Server** - Command-line tool for PDF manipulation
3. **PDF24 Creator** - Free PDF editor

### Professional Options
1. **Adobe Acrobat Pro** - Industry standard (paid)
2. **Foxit PhantomPDF** - Alternative professional tool (paid)

## Step-by-Step Process

### Using LibreOffice Draw (Recommended Free Option)

1. **Open PDF in LibreOffice Draw**
   ```bash
   # Open LibreOffice Draw
   libreoffice --draw template.pdf
   ```

2. **Add Form Controls**
   - Go to `View` → `Toolbars` → `Form Controls`
   - Click on the Form Controls toolbar that appears
   - Select the type of field you want to add

3. **Add Text Fields**
   - Click the "Text Box" icon in Form Controls toolbar
   - Draw a rectangle where you want the text field
   - Right-click → `Control Properties`
   - Set the `Name` property (e.g., "test.name")

4. **Add Checkboxes**
   - Click the "Check Box" icon
   - Draw where you want the checkbox
   - Set `Name` property (e.g., "test.homme", "test.femme")

5. **Save as PDF**
   - `File` → `Export as PDF`
   - Check "Create PDF form" option
   - Save with form fields preserved

### Using Adobe Acrobat Pro

1. **Open PDF in Acrobat**
   - File → Open → Select your template

2. **Prepare Form**
   - Tools → Prepare Form
   - Acrobat will auto-detect potential form fields

3. **Add/Edit Fields**
   - Use the toolbar to add text fields, checkboxes, etc.
   - Double-click fields to edit properties
   - Set meaningful names for each field

4. **Set Field Properties**
   - Right-click field → Properties
   - General tab: Set field name
   - Options tab: Set default values, choices, etc.

5. **Save PDF**
   - File → Save (preserves form fields)

## Field Naming Convention

### Current Test Fields
- `test.name` - Student's full name (text field)
- `test.homme` - Male gender (checkbox)
- `test.femme` - Female gender (checkbox)

### Recommended Naming Pattern
```
section.fieldname
student.firstName
student.lastName
parent1.email
address.street
emergency.phone
```

### Examples for Different Forms

**PERISCOLAIRE Template Fields:**
```
student.firstName
student.lastName
student.birthDate
student.grade
parent1.name
parent1.phone
parent1.email
address.full
emergency.contact
activities.cantine
activities.garderie
```

**EDPP Template Fields:**
```
child.fullName
child.birthDate
child.nationality
father.lastName
father.firstName
father.phone
mother.lastName
mother.firstName
mother.phone
address.street
address.city
address.postalCode
```

## Field Types and Properties

### Text Fields
- **Use for**: Names, addresses, phone numbers, emails
- **Properties**: 
  - Name: Unique identifier
  - Default Value: Optional pre-filled text
  - Multiline: For addresses or comments

### Checkboxes
- **Use for**: Yes/No questions, multiple choice options
- **Properties**:
  - Name: Unique identifier
  - Export Value: Value when checked (usually "true" or "1")
  - Default State: Checked or unchecked

### Radio Buttons
- **Use for**: Single choice from multiple options
- **Properties**:
  - Group Name: Same for all related options
  - Export Value: Unique value for each option

### Dropdowns
- **Use for**: Selection from predefined list
- **Properties**:
  - Name: Unique identifier
  - Options: List of selectable values

## Testing Form Fields

### Manual Testing
1. Open the PDF with form fields
2. Try filling each field manually
3. Verify field names are accessible

### Programmatic Testing
Use our analysis tool:
```typescript
import { analyzePDFTemplate } from './utils/pdf';

const fields = await analyzePDFTemplate('template-name');
console.log('Available fields:', fields);
```

## Common Issues and Solutions

### Fields Not Detected
- **Problem**: PDF fields not recognized by our system
- **Solution**: 
  - Check field names don't contain special characters
  - Ensure PDF was saved with form fields enabled
  - Verify fields are properly formed

### Overlapping Fields
- **Problem**: Form fields overlap with text or other elements
- **Solution**:
  - Resize fields to fit designated areas
  - Use transparent backgrounds
  - Adjust field positioning

### Wrong Field Types
- **Problem**: Field doesn't work as expected
- **Solution**:
  - Check field type matches intended use
  - Verify field properties are correct
  - Test with simple values first

## Best Practices

### Design Guidelines
1. **Clear Boundaries**: Make field areas visually distinct
2. **Appropriate Sizing**: Size fields to accommodate expected content
3. **Consistent Spacing**: Maintain uniform spacing between fields
4. **Visual Hierarchy**: Group related fields together

### Technical Guidelines
1. **Unique Names**: Each field must have a unique name
2. **Descriptive Names**: Use clear, descriptive field names
3. **Test Early**: Test fields immediately after creation
4. **Document Mappings**: Keep track of field names and purposes

### Accessibility
1. **Tab Order**: Set logical tab order for keyboard navigation
2. **Tooltips**: Add helpful tooltips to fields
3. **High Contrast**: Ensure fields are visible in high contrast mode
4. **Screen Reader**: Test with screen reader software

## Template Validation Checklist

Before using a template in production:

- [ ] All required fields are present
- [ ] Field names match mapping configuration
- [ ] Fields are properly sized and positioned
- [ ] Tab order is logical
- [ ] Form fields don't overlap with existing content
- [ ] PDF opens correctly in different viewers
- [ ] Fields can be filled manually
- [ ] Automated filling works as expected

## Maintenance

### Version Control
- Keep original PDFs separate from form-enabled versions
- Version template files with dates or version numbers
- Document changes made to each template version

### Updates
- When forms change, update both PDF template and field mappings
- Test thoroughly after any changes
- Maintain backward compatibility when possible

## Tools and Resources

### Free PDF Form Tools
- [LibreOffice](https://www.libreoffice.org/) - Free office suite with PDF form support
- [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) - Command-line PDF toolkit
- [PDF24](https://tools.pdf24.org/) - Online PDF tools

### Documentation
- [PDF Form Field Specification](https://opensource.adobe.com/dc-acrobat-sdk-docs/standards/pdfstandards/pdf/PDF32000_2008.pdf)
- [LibreOffice Draw Guide](https://documentation.libreoffice.org/en/english-documentation/)

### Validation Tools
Our built-in template analysis:
```typescript
await analyzePDFTemplate('template-name');
```
