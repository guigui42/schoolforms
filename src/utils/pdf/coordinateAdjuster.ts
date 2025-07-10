/**
 * Interactive PDF Coordinate Adjuster
 * Helps fine-tune coordinates by generating test PDFs with adjustable positions
 */

export interface CoordinateAdjustment {
  fieldName: string;
  originalX: number;
  originalY: number;
  adjustedX: number;
  adjustedY: number;
  notes?: string;
}

export class CoordinateAdjuster {
  private adjustments: CoordinateAdjustment[] = [];
  
  addAdjustment(fieldName: string, originalX: number, originalY: number, adjustedX: number, adjustedY: number, notes?: string) {
    const existing = this.adjustments.find(a => a.fieldName === fieldName);
    if (existing) {
      existing.adjustedX = adjustedX;
      existing.adjustedY = adjustedY;
      existing.notes = notes;
    } else {
      this.adjustments.push({
        fieldName,
        originalX,
        originalY,
        adjustedX,
        adjustedY,
        notes
      });
    }
  }
  
  getAdjustments(): CoordinateAdjustment[] {
    return [...this.adjustments];
  }
  
  exportAdjustments(): string {
    const code = this.adjustments.map(adj => {
      return `    '${adj.fieldName}': { x: ${adj.adjustedX}, y: ${adj.adjustedY}, fontSize: 10 }, ${adj.notes ? `// ${adj.notes}` : ''}`;
    }).join('\n');
    
    return `// Updated coordinates based on adjustments:\n${code}`;
  }
  
  clearAdjustments() {
    this.adjustments = [];
  }
}

/**
 * Quick coordinate adjustment presets for common issues
 */
export const COORDINATE_ADJUSTMENTS = {
  // Move all fields right by 20 points
  MOVE_RIGHT_20: (x: number, y: number) => ({ x: x + 20, y }),
  
  // Move all fields left by 20 points
  MOVE_LEFT_20: (x: number, y: number) => ({ x: x - 20, y }),
  
  // Move all fields up by 20 points
  MOVE_UP_20: (x: number, y: number) => ({ x, y: y + 20 }),
  
  // Move all fields down by 20 points
  MOVE_DOWN_20: (x: number, y: number) => ({ x, y: y - 20 }),
  
  // Apply fine adjustments
  FINE_TUNE: (x: number, y: number, deltaX: number = 0, deltaY: number = 0) => ({ x: x + deltaX, y: y + deltaY }),
};

/**
 * Helper to generate multiple test PDFs with different coordinate adjustments
 */
export async function generateMultipleTestPDFs(
  templatePath: string,
  testData: Record<string, string>,
  adjustments: Array<{ name: string; adjustment: (x: number, y: number) => { x: number; y: number } }>
): Promise<void> {
  // Log the parameters for future implementation
  console.log('Template path:', templatePath);
  console.log('Test data:', testData);
  
  for (const { name, adjustment } of adjustments) {
    console.log(`Generating test PDF: ${name}`);
    
    // This would integrate with your existing PDF generation
    // For now, just log the adjustment
    console.log(`Adjustment: ${name}`, adjustment(200, 400));
  }
}

// Example usage:
export const QUICK_TESTS = [
  { name: 'Original', adjustment: (x: number, y: number) => ({ x, y }) },
  { name: 'Move Right 20', adjustment: COORDINATE_ADJUSTMENTS.MOVE_RIGHT_20 },
  { name: 'Move Left 20', adjustment: COORDINATE_ADJUSTMENTS.MOVE_LEFT_20 },
  { name: 'Move Up 20', adjustment: COORDINATE_ADJUSTMENTS.MOVE_UP_20 },
  { name: 'Move Down 20', adjustment: COORDINATE_ADJUSTMENTS.MOVE_DOWN_20 },
];
