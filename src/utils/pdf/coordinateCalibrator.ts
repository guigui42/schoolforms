import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Coordinate Calibration Tool for PDF Forms
 * This tool helps us find the correct coordinates for each field by generating test PDFs
 */

export interface TestCoordinate {
  name: string;
  x: number;
  y: number;
  color?: [number, number, number];
  fontSize?: number;
}

export class CoordinateCalibrator {
  private pdfDoc: PDFDocument | null = null;

  async loadTemplate(templatePath: string): Promise<void> {
    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
    } catch (error) {
      console.error('Error loading PDF template:', error);
      throw new Error(`Could not load PDF template from ${templatePath}`);
    }
  }

  async generateTestPDF(testCoordinates: TestCoordinate[]): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('No PDF template loaded');
    }

    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add test markers
    testCoordinates.forEach((coord, index) => {
      const color = coord.color || [1, 0, 0]; // Default red
      const fontSize = coord.fontSize || 8;
      
      // Draw the test text
      firstPage.drawText(`${coord.name} (${coord.x},${coord.y})`, {
        x: coord.x,
        y: coord.y,
        size: fontSize,
        font,
        color: rgb(color[0], color[1], color[2]),
      });
      
      // Draw a small circle as a position marker
      firstPage.drawCircle({
        x: coord.x,
        y: coord.y,
        size: 2,
        color: rgb(color[0], color[1], color[2]),
      });
      
      // Draw grid lines for reference
      if (index < 5) { // Only for first few to avoid clutter
        // Vertical line
        firstPage.drawLine({
          start: { x: coord.x, y: 0 },
          end: { x: coord.x, y: firstPage.getHeight() },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        
        // Horizontal line
        firstPage.drawLine({
          start: { x: 0, y: coord.y },
          end: { x: firstPage.getWidth(), y: coord.y },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      }
    });

    return await this.pdfDoc.save();
  }

  async downloadTestPDF(testCoordinates: TestCoordinate[], filename: string): Promise<void> {
    const pdfBytes = await this.generateTestPDF(testCoordinates);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * ALSH EDPP Form Analysis - Corrected coordinates based on visual inspection
 * 
 * UNDERSTANDING THE COORDINATE SYSTEM:
 * - PDF: (0,0) is at BOTTOM-LEFT, Y increases upward
 * - Visual: (0,0) is at TOP-LEFT, Y increases downward
 * - PDF Height: ~842 points (A4)
 * - Conversion: PDF_Y = 842 - Visual_Y
 * 
 * FIELD ANALYSIS FROM CALIBRATION IMAGE:
 * Looking at the calibration image, the fields appear to be positioned as follows:
 * - Child info section: around visual Y 280-320 (PDF Y 560-520)
 * - Address section: around visual Y 360-390 (PDF Y 480-450)  
 * - Father section: around visual Y 490-530 (PDF Y 350-310)
 * - Mother section: around visual Y 690-730 (PDF Y 150-110)
 */
export const ALSH_EDPP_TEST_COORDINATES: TestCoordinate[] = [
  // Child information section - RED
  // Visual estimate: Y ~280-320, converting to PDF coordinates
  { name: 'Child-LastName', x: 270, y: 560, color: [1, 0, 0] },      // 842 - 280 = 562
  { name: 'Child-FirstName', x: 400, y: 560, color: [1, 0, 0] },     // Same row
  { name: 'Child-BirthDate', x: 270, y: 530, color: [1, 0, 0] },     // 842 - 310 = 532
  { name: 'Child-Nationality', x: 500, y: 530, color: [1, 0, 0] },   // Same row
  { name: 'Child-Grade', x: 270, y: 200, color: [1, 0, 0] },         // Much lower on form
  
  // Address section - GREEN  
  // Visual estimate: Y ~360-390, converting to PDF coordinates
  { name: 'Address-Street', x: 170, y: 480, color: [0, 1, 0] },      // 842 - 360 = 482
  { name: 'Address-PostalCode', x: 270, y: 450, color: [0, 1, 0] },  // 842 - 390 = 452
  { name: 'Address-City', x: 400, y: 450, color: [0, 1, 0] },        // Same row
  
  // Father section - BLUE
  // Visual estimate: Y ~490-530, converting to PDF coordinates  
  { name: 'Father-LastName', x: 270, y: 350, color: [0, 0, 1] },     // 842 - 490 = 352
  { name: 'Father-FirstName', x: 430, y: 350, color: [0, 0, 1] },    // Same row
  { name: 'Father-Mobile', x: 200, y: 320, color: [0, 0, 1] },       // 842 - 520 = 322
  { name: 'Father-Email', x: 370, y: 320, color: [0, 0, 1] },        // Same row
  
  // Mother section - MAGENTA
  // Visual estimate: Y ~690-730, converting to PDF coordinates
  { name: 'Mother-MaidenName', x: 430, y: 150, color: [1, 0, 1] },   // 842 - 690 = 152
  { name: 'Mother-FirstName', x: 270, y: 120, color: [1, 0, 1] },    // 842 - 720 = 122
  { name: 'Mother-Mobile', x: 200, y: 90, color: [1, 0, 1] },        // 842 - 750 = 92
  { name: 'Mother-Email', x: 370, y: 90, color: [1, 0, 1] },         // Same row
  
  // Emergency contact - ORANGE (estimated position)
  { name: 'Emergency-Name', x: 200, y: 200, color: [1, 0.5, 0] },
  { name: 'Emergency-Phone', x: 200, y: 180, color: [1, 0.5, 0] },
  
  // Grid reference points - GRAY (to verify coordinate system)
  { name: 'Grid-100x100', x: 100, y: 100, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-200x200', x: 200, y: 200, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-300x300', x: 300, y: 300, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-400x400', x: 400, y: 400, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-500x500', x: 500, y: 500, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-600x600', x: 600, y: 600, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-700x700', x: 700, y: 700, color: [0.5, 0.5, 0.5], fontSize: 6 },
  { name: 'Grid-800x800', x: 800, y: 800, color: [0.5, 0.5, 0.5], fontSize: 6 },
  
  // Page corners for reference
  { name: 'TopLeft', x: 50, y: 800, color: [0, 0, 0], fontSize: 8 },
  { name: 'TopRight', x: 545, y: 800, color: [0, 0, 0], fontSize: 8 },
  { name: 'BottomLeft', x: 50, y: 50, color: [0, 0, 0], fontSize: 8 },
  { name: 'BottomRight', x: 545, y: 50, color: [0, 0, 0], fontSize: 8 },
];

/**
 * Quick test function to generate calibration PDF
 */
export async function generateCalibrationPDF(): Promise<void> {
  try {
    const calibrator = new CoordinateCalibrator();
    
    // Use the filename from the template registry
    const fileName = 'Dossier d\'inscription ALSH - EDPP 2025-2026.pdf';
    const templatePath = `/templates/${encodeURIComponent(fileName)}`;
    console.log('Loading template from:', templatePath);
    
    await calibrator.loadTemplate(templatePath);
    await calibrator.downloadTestPDF(
      ALSH_EDPP_TEST_COORDINATES, 
      'alsh-edpp-coordinate-calibration.pdf'
    );
    
    console.log('Calibration PDF generated successfully');
  } catch (error) {
    console.error('Error generating calibration PDF:', error);
    throw error;
  }
}
