import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * PDF Coordinate System Analyzer
 * This tool helps us understand the PDF coordinate system and calculate proper field positions
 */

export interface PDFDimensions {
  width: number;
  height: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface FieldPosition {
  name: string;
  visualX: number; // X position as seen on screen/print
  visualY: number; // Y position as seen on screen/print
  pdfX: number;    // Calculated PDF X coordinate
  pdfY: number;    // Calculated PDF Y coordinate
}

export class CoordinateAnalyzer {
  private pdfDoc: PDFDocument | null = null;
  private dimensions: PDFDimensions | null = null;

  async loadTemplate(templatePath: string): Promise<void> {
    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get page dimensions
      const pages = this.pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      
      this.dimensions = {
        width,
        height,
        margins: {
          top: 50,    // Estimated
          right: 50,  // Estimated
          bottom: 50, // Estimated
          left: 50,   // Estimated
        }
      };
      
      console.log('PDF Dimensions:', this.dimensions);
      console.log('PDF coordinate system: (0,0) is at bottom-left');
      console.log('Visual coordinate system: (0,0) is at top-left');
      
    } catch (error) {
      console.error('Error loading PDF template:', error);
      throw new Error(`Could not load PDF template from ${templatePath}`);
    }
  }

  /**
   * Convert visual coordinates (as seen on screen) to PDF coordinates
   * Visual: (0,0) is top-left
   * PDF: (0,0) is bottom-left
   */
  visualToPDF(visualX: number, visualY: number): { x: number; y: number } {
    if (!this.dimensions) {
      throw new Error('PDF dimensions not loaded');
    }
    
    return {
      x: visualX,
      y: this.dimensions.height - visualY // Flip Y coordinate
    };
  }

  /**
   * Convert PDF coordinates to visual coordinates
   */
  pdfToVisual(pdfX: number, pdfY: number): { x: number; y: number } {
    if (!this.dimensions) {
      throw new Error('PDF dimensions not loaded');
    }
    
    return {
      x: pdfX,
      y: this.dimensions.height - pdfY // Flip Y coordinate
    };
  }

  /**
   * Generate a comprehensive grid to understand the coordinate system
   */
  async generateCoordinateGrid(): Promise<Uint8Array> {
    if (!this.pdfDoc || !this.dimensions) {
      throw new Error('PDF not loaded');
    }

    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw coordinate grid
    const gridSpacing = 50;
    const { width, height } = this.dimensions;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSpacing) {
      firstPage.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Add coordinate labels
      if (x % 100 === 0) {
        firstPage.drawText(`${x}`, {
          x: x + 2,
          y: height - 20,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSpacing) {
      firstPage.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Add coordinate labels
      if (y % 100 === 0) {
        firstPage.drawText(`${y}`, {
          x: 5,
          y: y + 2,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }

    // Add corner markers
    const cornerSize = 10;
    const corners = [
      { x: 0, y: 0, label: 'PDF (0,0)' },
      { x: width, y: 0, label: `PDF (${width},0)` },
      { x: 0, y: height, label: `PDF (0,${height})` },
      { x: width, y: height, label: `PDF (${width},${height})` },
    ];

    corners.forEach(corner => {
      firstPage.drawRectangle({
        x: corner.x - cornerSize/2,
        y: corner.y - cornerSize/2,
        width: cornerSize,
        height: cornerSize,
        color: rgb(1, 0, 0),
      });
      
      firstPage.drawText(corner.label, {
        x: corner.x + 15,
        y: corner.y - 5,
        size: 10,
        font,
        color: rgb(1, 0, 0),
      });
    });

    return await this.pdfDoc.save();
  }

  /**
   * Analyze form fields based on visual inspection
   * Looking at the calibration image, I can see the approximate positions
   */
  getFormFieldPositions(): FieldPosition[] {
    if (!this.dimensions) {
      throw new Error('PDF dimensions not loaded');
    }

    // Based on the calibration image, let me estimate the visual positions
    // and convert them to PDF coordinates
    const visualPositions = [
      // Child section (top part of form)
      { name: 'Child-LastName', visualX: 270, visualY: 300 },  // Approximate visual position
      { name: 'Child-FirstName', visualX: 400, visualY: 300 },
      { name: 'Child-BirthDate', visualX: 270, visualY: 330 },
      { name: 'Child-Nationality', visualX: 500, visualY: 330 },
      
      // Address section
      { name: 'Address-Street', visualX: 170, visualY: 370 },
      { name: 'Address-PostalCode', visualX: 270, visualY: 400 },
      { name: 'Address-City', visualX: 400, visualY: 400 },
      
      // Father section (middle)
      { name: 'Father-LastName', visualX: 270, visualY: 490 },
      { name: 'Father-FirstName', visualX: 430, visualY: 490 },
      { name: 'Father-Mobile', visualX: 200, visualY: 580 },
      { name: 'Father-Email', visualX: 370, visualY: 580 },
      
      // Mother section (bottom)
      { name: 'Mother-MaidenName', visualX: 430, visualY: 690 },
      { name: 'Mother-FirstName', visualX: 270, visualY: 720 },
      { name: 'Mother-Mobile', visualX: 200, visualY: 780 },
      { name: 'Mother-Email', visualX: 370, visualY: 780 },
    ];

    return visualPositions.map(pos => {
      const pdfCoords = this.visualToPDF(pos.visualX, pos.visualY);
      return {
        name: pos.name,
        visualX: pos.visualX,
        visualY: pos.visualY,
        pdfX: pdfCoords.x,
        pdfY: pdfCoords.y,
      };
    });
  }

  getDimensions(): PDFDimensions | null {
    return this.dimensions;
  }
}

/**
 * Quick test function to generate coordinate analysis
 */
export async function analyzeCoordinates(): Promise<void> {
  try {
    const analyzer = new CoordinateAnalyzer();
    
    const fileName = 'Dossier d\'inscription ALSH - EDPP 2025-2026.pdf';
    const templatePath = `/templates/${encodeURIComponent(fileName)}`;
    
    await analyzer.loadTemplate(templatePath);
    
    const gridBytes = await analyzer.generateCoordinateGrid();
    const blob = new Blob([gridBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'coordinate-analysis-grid.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Coordinate analysis PDF generated');
    console.log('PDF dimensions:', analyzer.getDimensions());
    
    const fieldPositions = analyzer.getFormFieldPositions();
    console.log('Field positions:', fieldPositions);
    
  } catch (error) {
    console.error('Error analyzing coordinates:', error);
    throw error;
  }
}
