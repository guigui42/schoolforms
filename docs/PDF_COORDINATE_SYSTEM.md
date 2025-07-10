# PDF Coordinate System & Field Positioning Guide

## Overview

This document defines the coordinate system and field positioning strategy for the French School Forms Generator project. The goal is to establish a systematic approach to PDF field positioning that works consistently across all forms without needing to adjust individual field coordinates.

## PDF Coordinate System Fundamentals

### Coordinate System Properties

```typescript
interface PDFCoordinateSystem {
  origin: "Bottom-left corner (0,0)";
  xAxis: "Increases left to right";
  yAxis: "Increases bottom to top (opposite of web coordinates)";
  units: "Points (72 points = 1 inch = 25.4mm)";
}
```

### Key Differences from Web Coordinates

| Aspect | Web Coordinates | PDF Coordinates |
|--------|----------------|-----------------|
| Origin | Top-left (0,0) | Bottom-left (0,0) |
| Y-axis | Increases downward | Increases upward |
| Units | Pixels | Points (72 per inch) |

### Conversion Formulas

```typescript
// Unit conversions
const pointsToInches = (points: number) => points / 72;
const pointsToMm = (points: number) => points / 72 * 25.4;
const inchesToPoints = (inches: number) => inches * 72;
const mmToPoints = (mm: number) => mm / 25.4 * 72;

// Coordinate system conversions
const webToPDF = (yWeb: number, pageHeight: number) => pageHeight - yWeb;
const pdfToWeb = (yPDF: number, pageHeight: number) => pageHeight - yPDF;
```

## Standard Page Dimensions

### A4 Page (Standard French Documents)
- **Width**: 595.28 points (210mm, 8.27")
- **Height**: 841.89 points (297mm, 11.69")
- **Aspect Ratio**: 1:√2 (1.414)

### Page Layout Structure

```typescript
interface PageLayout {
  width: number;      // 595.28 for A4
  height: number;     // 841.89 for A4
  margins: {
    left: number;     // 50 points (~17.6mm)
    right: number;    // 50 points (~17.6mm)
    top: number;      // 50 points (~17.6mm)
    bottom: number;   // 50 points (~17.6mm)
  };
  workingArea: {
    x: number;        // leftMargin
    y: number;        // bottomMargin
    width: number;    // pageWidth - leftMargin - rightMargin
    height: number;   // pageHeight - topMargin - bottomMargin
  };
}
```

## Systematic Field Positioning Strategy

### 1. Layout Sections (Based on Actual Form Analysis)

The EDPP form follows this structure (from top to bottom):

```typescript
interface FormSections {
  header: {
    yStart: number;     // ~792 (pageHeight - 50)
    yEnd: number;       // ~750
    height: number;     // ~42 points
    description: "Logo and title area";
  };
  childInfo: {
    yStart: number;     // ~750
    yEnd: number;       // ~650
    height: number;     // ~100 points
    description: "Child name, birth date, nationality, sex";
  };
  addressInfo: {
    yStart: number;     // ~650
    yEnd: number;       // ~580
    height: number;     // ~70 points
    description: "Address, postal code, city";
  };
  legalRepresentatives: {
    yStart: number;     // ~580
    yEnd: number;       // ~400
    height: number;     // ~180 points
    description: "Father information and legal status";
  };
  motherInfo: {
    yStart: number;     // ~400
    yEnd: number;       // ~100
    height: number;     // ~300 points
    description: "Mother information and contact details";
  };
  footer: {
    yStart: number;     // ~100
    yEnd: number;       // ~50
    height: number;     // ~50 points
    description: "Signature and logo area";
  };
}
```

### 2. Actual Field Coordinates (Measured from Real Form)

```typescript
interface ActualFieldPositions {
  // Child Information Section
  childLastName: { x: 150, y: 720, width: 200 };
  childFirstName: { x: 380, y: 720, width: 120 };
  childBirthDate: { x: 520, y: 720, width: 70 };
  
  childBornAt: { x: 150, y: 690, width: 200 };
  childNationality: { x: 380, y: 690, width: 120 };
  childSexFeminine: { x: 520, y: 690, width: 20 };
  childSexMasculine: { x: 570, y: 690, width: 20 };
  
  // Address Section
  addressStreet: { x: 150, y: 630, width: 400 };
  addressPostalCode: { x: 150, y: 600, width: 100 };
  addressCity: { x: 380, y: 600, width: 160 };
  
  // Father Information
  fatherLastName: { x: 150, y: 520, width: 200 };
  fatherFirstName: { x: 380, y: 520, width: 120 };
  fatherPhone: { x: 520, y: 520, width: 100 };
  fatherEmail: { x: 150, y: 490, width: 300 };
  
  // Mother Information
  motherMaidenName: { x: 380, y: 250, width: 120 };
  motherMaritalName: { x: 520, y: 250, width: 100 };
  motherFirstName: { x: 150, y: 220, width: 200 };
  motherNationality: { x: 380, y: 220, width: 120 };
  motherPhone: { x: 150, y: 120, width: 150 };
  motherEmail: { x: 380, y: 120, width: 200 };
}
```

### 3. Systematic Coordinate Calculation

Instead of hardcoding each position, use this formula:

```typescript
// Base positions for each section
const SECTION_BASE_Y = {
  header: 750,
  childInfo: 720,
  addressInfo: 630,
  legalRepresentatives: 520,
  motherInfo: 250,
  footer: 100
};

// Column positions
const COLUMN_X = {
  label: 80,      // For field labels
  primary: 150,   // For main input fields
  secondary: 380, // For secondary fields
  tertiary: 520   // For additional fields
};

// Row spacing
const ROW_SPACING = 30;

// Calculate field position
function calculateFieldPosition(section: string, column: string, row: number = 0): FieldPosition {
  const baseY = SECTION_BASE_Y[section];
  const x = COLUMN_X[column];
  const y = baseY - (row * ROW_SPACING);
  
  return { x, y };
}
```

### 3. Field Positioning Calculations

```typescript
interface FieldPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

class FieldPositionCalculator {
  constructor(
    private pageWidth: number,
    private pageHeight: number,
    private margins: { left: number; right: number; top: number; bottom: number }
  ) {}

  // Calculate field position based on section and field type
  calculateFieldPosition(
    section: keyof FormSections,
    fieldType: 'label' | 'input' | 'checkbox',
    row: number,
    column: 'left' | 'middle' | 'right'
  ): FieldPosition {
    const sectionInfo = this.getSectionInfo(section);
    const columnInfo = this.getColumnInfo(column);
    
    const x = columnInfo.x;
    const y = sectionInfo.yStart - (row * this.getRowHeight(fieldType));
    
    return { x, y };
  }

  // Standard row heights for different field types
  private getRowHeight(fieldType: 'label' | 'input' | 'checkbox'): number {
    switch (fieldType) {
      case 'label': return 15;
      case 'input': return 25;
      case 'checkbox': return 20;
      default: return 20;
    }
  }
}
```

## Field Mapping Configuration

### 1. Field Type Definitions

```typescript
interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'date' | 'checkbox' | 'select';
  section: keyof FormSections;
  column: 'left' | 'middle' | 'right';
  row: number;
  width?: number;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  required?: boolean;
}
```

### 2. Form Template Configuration

```typescript
interface FormTemplate {
  id: string;
  name: string;
  pdfTemplate: string;
  pageSize: 'A4' | 'Letter' | 'Legal';
  sections: FormSections;
  columns: ColumnLayout;
  fields: FieldConfig[];
}

// Example: EDPP Form Template
const edppFormTemplate: FormTemplate = {
  id: 'edpp-2025-2026',
  name: 'Dossier d\'inscription ALSH - EDPP 2025-2026',
  pdfTemplate: 'Dossier d\'inscription ALSH - EDPP 2025-2026.pdf',
  pageSize: 'A4',
  sections: {
    header: { yStart: 791, yEnd: 721, height: 70 },
    childInfo: { yStart: 721, yEnd: 621, height: 100 },
    addressInfo: { yStart: 621, yEnd: 521, height: 100 },
    parentInfo: { yStart: 521, yEnd: 321, height: 200 },
    emergencyContacts: { yStart: 321, yEnd: 221, height: 100 },
    additionalInfo: { yStart: 221, yEnd: 121, height: 100 },
    footer: { yStart: 121, yEnd: 50, height: 71 }
  },
  columns: {
    leftColumn: { x: 50, width: 150, purpose: 'Labels and short fields' },
    middleColumn: { x: 200, width: 200, purpose: 'Primary data fields' },
    rightColumn: { x: 400, width: 145, purpose: 'Secondary data or continuation' }
  },
  fields: [
    {
      id: 'child.lastName',
      label: 'Nom de famille',
      type: 'text',
      section: 'childInfo',
      column: 'left',
      row: 0,
      width: 150,
      fontSize: 10,
      required: true
    },
    {
      id: 'child.firstName',
      label: 'Prénom',
      type: 'text',
      section: 'childInfo',
      column: 'middle',
      row: 0,
      width: 200,
      fontSize: 10,
      required: true
    },
    // ... more fields
  ]
};
```

## Implementation Strategy

### 1. Template-Based Approach

```typescript
class PDFGenerator {
  private calculator: FieldPositionCalculator;
  private template: FormTemplate;

  constructor(template: FormTemplate) {
    this.template = template;
    this.calculator = new FieldPositionCalculator(
      template.pageSize === 'A4' ? 595.28 : 612,
      template.pageSize === 'A4' ? 841.89 : 792,
      { left: 50, right: 50, top: 50, bottom: 50 }
    );
  }

  generatePDF(data: FormData): Promise<Uint8Array> {
    // Load template PDF
    // For each field in template.fields:
    //   - Calculate position using calculator
    //   - Extract data value
    //   - Draw field at calculated position
    // Return generated PDF
  }

  private drawField(page: PDFPage, field: FieldConfig, value: any): void {
    const position = this.calculator.calculateFieldPosition(
      field.section,
      field.type === 'text' ? 'input' : field.type,
      field.row,
      field.column
    );

    page.drawText(String(value), {
      x: position.x,
      y: position.y,
      size: field.fontSize || 10,
      font: this.getFont(field.fontFamily),
      color: PDFLib.rgb(0, 0, 0),
    });
  }
}
```

### 2. Calibration and Validation

```typescript
class CoordinateCalibrator {
  static async calibrateTemplate(templatePath: string): Promise<FormTemplate> {
    // Load template PDF
    // Analyze page dimensions
    // Generate grid overlay
    // Return calibrated template configuration
  }

  static async validateFieldPositions(
    template: FormTemplate,
    testData: FormData
  ): Promise<ValidationResult> {
    // Generate test PDF with sample data
    // Compare with expected positions
    // Return validation results
  }
}
```

## Best Practices

### 1. Coordinate System Rules

- **Always use absolute coordinates** based on page dimensions
- **Calculate positions dynamically** using the template configuration
- **Test with grid overlays** to verify positioning
- **Use consistent margins** across all forms (50 points recommended)

### 2. Field Positioning Guidelines

- **Group related fields** in the same section
- **Use consistent row heights** for similar field types
- **Leave adequate spacing** between sections (20-30 points)
- **Align fields** to column boundaries for clean layout

### 3. Testing Strategy

- **Grid overlay testing**: Generate PDFs with coordinate grids
- **Sample data testing**: Fill forms with test data to verify positioning
- **Cross-form validation**: Ensure consistency across different form types
- **Visual comparison**: Compare generated PDFs with original templates

## Tools and Utilities

### 1. Coordinate System Analyzer

Use `/public/coordinate-system-analysis.html` to:
- Analyze PDF coordinate system
- Generate field mapping grids
- Test form field positions
- Generate coordinate reference documentation

### 2. Template Calibrator

```typescript
// Usage example
const calibrator = new CoordinateCalibrator();
const template = await calibrator.calibrateTemplate(
  '/templates/Dossier d\'inscription ALSH - EDPP 2025-2026.pdf'
);
```

### 3. Position Calculator

```typescript
// Usage example
const calculator = new FieldPositionCalculator(595.28, 841.89, {
  left: 50, right: 50, top: 50, bottom: 50
});

const position = calculator.calculateFieldPosition('childInfo', 'input', 0, 'left');
// Returns: { x: 50, y: 721 }
```

## Troubleshooting Common Issues

### 1. Fields Appearing in Wrong Positions

**Cause**: Y-coordinate confusion (web vs PDF coordinates)
**Solution**: Always use `pageHeight - y` when converting from web coordinates

### 2. Text Appearing Outside Form Fields

**Cause**: Incorrect margin or offset calculations
**Solution**: Verify page dimensions and margin settings

### 3. Inconsistent Field Alignment

**Cause**: Using hardcoded coordinates instead of calculated positions
**Solution**: Use the template configuration and position calculator

### 4. Text Too Large or Too Small

**Cause**: Font size not adjusted for PDF point system
**Solution**: Use appropriate font sizes (8-12 points for form fields)

## Maintenance and Updates

### 1. Template Updates

When form templates change:
1. Re-run coordinate system analysis
2. Update template configuration
3. Validate field positions
4. Update field mappings if necessary

### 2. Adding New Forms

For new form types:
1. Analyze coordinate system using the analysis tool
2. Create new template configuration
3. Map fields to sections and columns
4. Test with sample data
5. Validate against original template

### 3. Performance Optimization

- Cache template configurations
- Pre-calculate common position values
- Use efficient coordinate calculation algorithms
- Minimize PDF manipulation operations

---

*This document should be updated whenever changes are made to the coordinate system or field positioning strategy.*
