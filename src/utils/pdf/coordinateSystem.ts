/**
 * PDF Coordinate System Utilities
 * 
 * This module provides utilities for working with PDF coordinates and field positioning
 * in a systematic way. It implements the coordinate system defined in the project documentation.
 */

// Standard page dimensions (in points)
export const PAGE_DIMENSIONS = {
  A4: { width: 595.28, height: 841.89 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 }
} as const;

// Standard margins (in points)
export const STANDARD_MARGINS = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50
} as const;

// Unit conversion utilities
export const Units = {
  pointsToInches: (points: number): number => points / 72,
  pointsToMm: (points: number): number => points / 72 * 25.4,
  inchesToPoints: (inches: number): number => inches * 72,
  mmToPoints: (mm: number): number => mm / 25.4 * 72,
  
  // Coordinate system conversion
  webToPDF: (yWeb: number, pageHeight: number): number => pageHeight - yWeb,
  pdfToWeb: (yPDF: number, pageHeight: number): number => pageHeight - yPDF,
};

// Field positioning interfaces
export interface FieldPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface PageLayout {
  width: number;
  height: number;
  margins: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  workingArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FormSection {
  yStart: number;
  yEnd: number;
  height: number;
}

export interface ColumnLayout {
  x: number;
  width: number;
  purpose: string;
}

export interface FormSections {
  header: FormSection;
  childInfo: FormSection;
  addressInfo: FormSection;
  parentInfo: FormSection;
  emergencyContacts: FormSection;
  additionalInfo: FormSection;
  footer: FormSection;
}

export interface FieldConfig {
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

export interface FormTemplate {
  id: string;
  name: string;
  pdfTemplate: string;
  pageSize: keyof typeof PAGE_DIMENSIONS;
  sections: FormSections;
  columns: {
    leftColumn: ColumnLayout;
    middleColumn: ColumnLayout;
    rightColumn: ColumnLayout;
  };
  fields: FieldConfig[];
}

/**
 * Field Position Calculator
 * 
 * Calculates field positions based on template configuration and coordinate system rules
 */
export class FieldPositionCalculator {
  private pageLayout: PageLayout;
  private sections: FormSections;
  private columns: FormTemplate['columns'];

  constructor(
    pageSize: keyof typeof PAGE_DIMENSIONS,
    margins: typeof STANDARD_MARGINS = STANDARD_MARGINS,
    sections: FormSections,
    columns: FormTemplate['columns']
  ) {
    const dimensions = PAGE_DIMENSIONS[pageSize];
    
    this.pageLayout = {
      width: dimensions.width,
      height: dimensions.height,
      margins,
      workingArea: {
        x: margins.left,
        y: margins.bottom,
        width: dimensions.width - margins.left - margins.right,
        height: dimensions.height - margins.top - margins.bottom
      }
    };
    
    this.sections = sections;
    this.columns = columns;
  }

  /**
   * Calculate field position based on section, column, and row
   */
  calculateFieldPosition(
    section: keyof FormSections,
    column: 'left' | 'middle' | 'right',
    row: number,
    fieldType: 'label' | 'input' | 'checkbox' = 'input'
  ): FieldPosition {
    const sectionInfo = this.sections[section];
    const columnInfo = this.getColumnInfo(column);
    const rowHeight = this.getRowHeight(fieldType);
    
    const x = columnInfo.x;
    const y = sectionInfo.yStart - (row * rowHeight);
    
    return {
      x,
      y,
      width: columnInfo.width,
      height: rowHeight
    };
  }

  /**
   * Calculate position for a specific field configuration
   */
  calculateFieldPositionFromConfig(fieldConfig: FieldConfig): FieldPosition {
    const fieldType = fieldConfig.type === 'text' || fieldConfig.type === 'date' || fieldConfig.type === 'select' 
      ? 'input' 
      : fieldConfig.type === 'checkbox' 
        ? 'checkbox' 
        : 'input';
    
    return this.calculateFieldPosition(
      fieldConfig.section,
      fieldConfig.column,
      fieldConfig.row,
      fieldType
    );
  }

  /**
   * Get column information
   */
  private getColumnInfo(column: 'left' | 'middle' | 'right'): ColumnLayout {
    switch (column) {
      case 'left': return this.columns.leftColumn;
      case 'middle': return this.columns.middleColumn;
      case 'right': return this.columns.rightColumn;
    }
  }

  /**
   * Get standard row height for different field types
   */
  private getRowHeight(fieldType: 'label' | 'input' | 'checkbox'): number {
    switch (fieldType) {
      case 'label': return 15;
      case 'input': return 25;
      case 'checkbox': return 20;
      default: return 20;
    }
  }

  /**
   * Get page layout information
   */
  getPageLayout(): PageLayout {
    return this.pageLayout;
  }

  /**
   * Get section information
   */
  getSectionInfo(section: keyof FormSections): FormSection {
    return this.sections[section];
  }
}

/**
 * Standard form template for EDPP forms (CALIBRATED VERSION)
 * Based on actual form analysis and visual calibration
 */
export const createEDPPFormTemplate = (): FormTemplate => {
  return {
    id: 'edpp-2025-2026',
    name: 'Dossier d\'inscription ALSH - EDPP 2025-2026',
    pdfTemplate: 'Dossier d\'inscription ALSH - EDPP 2025-2026.pdf',
    pageSize: 'A4',
    sections: {
      header: {
        yStart: 792,
        yEnd: 750,
        height: 42
      },
      childInfo: {
        yStart: 750,
        yEnd: 680,
        height: 70
      },
      addressInfo: {
        yStart: 650,
        yEnd: 580,
        height: 70
      },
      parentInfo: {
        yStart: 550,
        yEnd: 140,
        height: 410
      },
      emergencyContacts: {
        yStart: 140,
        yEnd: 100,
        height: 40
      },
      additionalInfo: {
        yStart: 100,
        yEnd: 60,
        height: 40
      },
      footer: {
        yStart: 60,
        yEnd: 50,
        height: 10
      }
    },
    columns: {
      leftColumn: {
        x: 150,
        width: 200,
        purpose: 'Primary input fields'
      },
      middleColumn: {
        x: 380,
        width: 140,
        purpose: 'Secondary input fields'
      },
      rightColumn: {
        x: 520,
        width: 75,
        purpose: 'Small fields and checkboxes'
      }
    },
    fields: [
      // Child Information - CALIBRATED COORDINATES
      {
        id: 'child.lastName',
        label: 'Nom de famille',
        type: 'text',
        section: 'childInfo',
        column: 'left',
        row: 0,
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
        fontSize: 10,
        required: true
      },
      {
        id: 'child.birthDate',
        label: 'Date de naissance',
        type: 'date',
        section: 'childInfo',
        column: 'right',
        row: 0,
        fontSize: 10,
        required: true
      },
      {
        id: 'child.bornAt',
        label: 'Né(e) à',
        type: 'text',
        section: 'childInfo',
        column: 'left',
        row: 1,
        fontSize: 10
      },
      {
        id: 'child.nationality',
        label: 'Nationalité',
        type: 'text',
        section: 'childInfo',
        column: 'middle',
        row: 1,
        fontSize: 10
      },
      {
        id: 'child.sex',
        label: 'Sexe',
        type: 'checkbox',
        section: 'childInfo',
        column: 'right',
        row: 1,
        fontSize: 10
      },
      
      // Address Information - CALIBRATED COORDINATES
      {
        id: 'address.street',
        label: 'Adresse',
        type: 'text',
        section: 'addressInfo',
        column: 'left',
        row: 0,
        fontSize: 10,
        required: true
      },
      {
        id: 'address.postalCode',
        label: 'Code postal',
        type: 'text',
        section: 'addressInfo',
        column: 'left',
        row: 1,
        fontSize: 10,
        required: true
      },
      {
        id: 'address.city',
        label: 'Ville',
        type: 'text',
        section: 'addressInfo',
        column: 'middle',
        row: 1,
        fontSize: 10,
        required: true
      },
      
      // Parent Information - CALIBRATED COORDINATES
      {
        id: 'father.lastName',
        label: 'Nom du père',
        type: 'text',
        section: 'parentInfo',
        column: 'left',
        row: 0,
        fontSize: 10,
        required: true
      },
      {
        id: 'father.firstName',
        label: 'Prénom du père',
        type: 'text',
        section: 'parentInfo',
        column: 'middle',
        row: 0,
        fontSize: 10,
        required: true
      },
      {
        id: 'father.phone',
        label: 'Téléphone du père',
        type: 'text',
        section: 'parentInfo',
        column: 'right',
        row: 0,
        fontSize: 10
      },
      {
        id: 'father.email',
        label: 'Email du père',
        type: 'text',
        section: 'parentInfo',
        column: 'left',
        row: 1,
        fontSize: 10
      },
      
      {
        id: 'mother.maidenName',
        label: 'Nom de jeune fille de la mère',
        type: 'text',
        section: 'parentInfo',
        column: 'middle',
        row: 8,
        fontSize: 10,
        required: true
      },
      {
        id: 'mother.firstName',
        label: 'Prénom de la mère',
        type: 'text',
        section: 'parentInfo',
        column: 'left',
        row: 9,
        fontSize: 10,
        required: true
      },
      {
        id: 'mother.phone',
        label: 'Téléphone de la mère',
        type: 'text',
        section: 'parentInfo',
        column: 'left',
        row: 12,
        fontSize: 10
      },
      {
        id: 'mother.email',
        label: 'Email de la mère',
        type: 'text',
        section: 'parentInfo',
        column: 'middle',
        row: 12,
        fontSize: 10
      }
    ]
  };
};

/**
 * CALIBRATED FIELD COORDINATES
 * Based on visual analysis and testing of the actual form
 */
export const EDPP_FIELD_COORDINATES = {
  // Page properties
  pageWidth: 595.28,
  pageHeight: 841.89,
  
  // Child Information Section
  'child.lastName': { x: 150, y: 740, width: 200 },
  'child.firstName': { x: 380, y: 740, width: 140 },
  'child.birthDate': { x: 520, y: 740, width: 60 },
  'child.bornAt': { x: 150, y: 710, width: 200 },
  'child.nationality': { x: 380, y: 710, width: 140 },
  'child.sex.feminine': { x: 520, y: 710, width: 20 },
  'child.sex.masculine': { x: 570, y: 710, width: 20 },
  
  // Address Section
  'address.street': { x: 150, y: 630, width: 400 },
  'address.postalCode': { x: 150, y: 600, width: 100 },
  'address.city': { x: 300, y: 600, width: 200 },
  
  // Father Information
  'father.lastName': { x: 150, y: 520, width: 200 },
  'father.firstName': { x: 380, y: 520, width: 140 },
  'father.phone': { x: 520, y: 520, width: 100 },
  'father.email': { x: 150, y: 490, width: 300 },
  'father.profession': { x: 150, y: 460, width: 200 },
  'father.employer': { x: 380, y: 460, width: 160 },
  'father.mobile': { x: 150, y: 430, width: 150 },
  
  // Mother Information
  'mother.maidenName': { x: 380, y: 300, width: 140 },
  'mother.maritalName': { x: 520, y: 300, width: 100 },
  'mother.firstName': { x: 150, y: 270, width: 200 },
  'mother.nationality': { x: 380, y: 270, width: 140 },
  'mother.profession': { x: 150, y: 180, width: 200 },
  'mother.employer': { x: 380, y: 180, width: 160 },
  'mother.mobile': { x: 150, y: 150, width: 150 },
  'mother.email': { x: 380, y: 150, width: 200 }
} as const;

/**
 * Coordinate System Analyzer
 * 
 * Provides utilities for analyzing and validating PDF coordinate systems
 */
export class CoordinateSystemAnalyzer {
  /**
   * Analyze page dimensions and return layout information
   */
  static analyzePageDimensions(width: number, height: number) {
    const widthInches = Units.pointsToInches(width);
    const heightInches = Units.pointsToInches(height);
    const widthMm = Units.pointsToMm(width);
    const heightMm = Units.pointsToMm(height);
    
    return {
      points: { width, height },
      inches: { 
        width: parseFloat(widthInches.toFixed(2)), 
        height: parseFloat(heightInches.toFixed(2)) 
      },
      mm: { 
        width: parseFloat(widthMm.toFixed(2)), 
        height: parseFloat(heightMm.toFixed(2)) 
      },
      standardSize: this.determineStandardSize(widthMm, heightMm)
    };
  }

  /**
   * Determine standard page size based on dimensions
   */
  private static determineStandardSize(widthMm: number, heightMm: number): string {
    const tolerance = 5; // 5mm tolerance
    
    if (Math.abs(widthMm - 210) < tolerance && Math.abs(heightMm - 297) < tolerance) {
      return 'A4';
    }
    if (Math.abs(widthMm - 216) < tolerance && Math.abs(heightMm - 279) < tolerance) {
      return 'US Letter';
    }
    if (Math.abs(widthMm - 216) < tolerance && Math.abs(heightMm - 356) < tolerance) {
      return 'US Legal';
    }
    
    return `Custom (${widthMm.toFixed(1)} x ${heightMm.toFixed(1)} mm)`;
  }

  /**
   * Generate grid coordinates for overlay
   */
  static generateGridCoordinates(
    pageWidth: number, 
    pageHeight: number, 
    spacing: number = 50
  ) {
    const gridLines = [];
    
    // Vertical lines
    for (let x = 0; x <= pageWidth; x += spacing) {
      gridLines.push({
        type: 'vertical' as const,
        x,
        y1: 0,
        y2: pageHeight,
        label: `x=${x}`
      });
    }
    
    // Horizontal lines
    for (let y = 0; y <= pageHeight; y += spacing) {
      gridLines.push({
        type: 'horizontal' as const,
        x1: 0,
        x2: pageWidth,
        y,
        label: `y=${y}`
      });
    }
    
    return gridLines;
  }

  /**
   * Validate field position against page boundaries
   */
  static validateFieldPosition(
    position: FieldPosition,
    pageLayout: PageLayout
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (position.x < 0) {
      issues.push('X coordinate is negative');
    }
    if (position.y < 0) {
      issues.push('Y coordinate is negative');
    }
    if (position.x > pageLayout.width) {
      issues.push('X coordinate exceeds page width');
    }
    if (position.y > pageLayout.height) {
      issues.push('Y coordinate exceeds page height');
    }
    
    if (position.width && position.x + position.width > pageLayout.width) {
      issues.push('Field extends beyond page width');
    }
    if (position.height && position.y + position.height > pageLayout.height) {
      issues.push('Field extends beyond page height');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}
