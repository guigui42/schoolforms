import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  Stack,
  Group,
  FileButton,
  TextInput,
  Modal,
  Card,
  Badge,
  ActionIcon,
  Grid,
  Alert,
  SegmentedControl,
} from '@mantine/core';
import {
  IconUpload,
  IconTrash,
  IconDownload,
  IconInfoCircle,
} from '@tabler/icons-react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFField {
  id: string;
  name: string;
  type: 'text' | 'checkbox';
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  isExisting?: boolean; // To differentiate between user-created and existing fields
}

export function PDFEditorPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fields, setFields] = useState<PDFField[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'text' | 'checkbox'>('text');
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentField, setCurrentField] = useState<PDFField | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [existingFields, setExistingFields] = useState<PDFField[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const pdfImageDataRef = useRef<ImageData | null>(null); // Cache the PDF rendering
  const lastPreviewBoxRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null); // Track last preview box

  const drawField = useCallback((ctx: CanvasRenderingContext2D, field: PDFField, currentScale: number) => {
    // Save canvas state before drawing
    ctx.save();
    
    try {
      const x = field.x * currentScale;
      const y = field.y * currentScale;
      const width = field.width * currentScale;
      const height = field.height * currentScale;
      
      // Different colors for existing vs new fields
      const isExisting = field.isExisting;
      const textColor = isExisting ? '#fd7e14' : '#339af0'; // orange for existing, blue for new
      const checkboxColor = isExisting ? '#fd7e14' : '#51cf66'; // orange for existing, green for new
      
      // Reset any previous drawing state
      ctx.setLineDash([]);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      
      // Draw field box
      ctx.strokeStyle = field.type === 'text' ? textColor : checkboxColor;
      ctx.lineWidth = isExisting ? 3 : 2; // Thicker border for existing fields
      ctx.strokeRect(x, y, width, height);
      
      // Fill with semi-transparent color
      ctx.fillStyle = field.type === 'text' 
        ? (isExisting ? 'rgba(253, 126, 20, 0.1)' : 'rgba(51, 154, 240, 0.1)')
        : (isExisting ? 'rgba(253, 126, 20, 0.1)' : 'rgba(81, 207, 102, 0.1)');
      ctx.fillRect(x, y, width, height);
      
      // Draw field name
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(field.name, x + 2, y - 4);
      
      // Add indicator for existing fields
      if (isExisting) {
        ctx.fillStyle = '#fd7e14';
        ctx.font = '10px Arial';
        ctx.fillText('(existant)', x + 2, y - 16);
      }
    } catch (error) {
      console.error('Error drawing field:', error);
    } finally {
      // Restore canvas state
      ctx.restore();
    }
  }, []);

  const extractExistingFields = useCallback(async (pdfDocument: PDFDocument) => {
    try {
      const form = pdfDocument.getForm();
      const existingFieldsData: PDFField[] = [];
      
      // Get all form fields
      const formFields = form.getFields();
      
      formFields.forEach((field, index) => {
        const fieldName = field.getName();
        const widgets = field.acroField.getWidgets();
        
        widgets.forEach((widget, widgetIndex) => {
          const rect = widget.getRectangle();
          // Try to get page reference - this API might vary
          let pageIndex = 0;
          try {
            // Find the page index by checking all pages
            const pages = pdfDocument.getPages();
            for (let i = 0; i < pages.length; i++) {
              // This is a simplified approach - might need adjustment based on actual pdf-lib API
              pageIndex = i;
              break;
            }
          } catch (error) {
            console.warn('Could not determine page index for field:', fieldName, error);
          }
          
          if (rect) {
            const pages = pdfDocument.getPages();
            const pageSize = pages[pageIndex].getSize();
            
            // Convert PDF coordinates to canvas coordinates
            const x = rect.x;
            const y = pageSize.height - rect.y - rect.height; // Convert from bottom-left to top-left origin
            const width = rect.width;
            const height = rect.height;
            
            // Determine field type
            let fieldType: 'text' | 'checkbox' = 'text';
            if (field.constructor.name === 'PDFCheckBox') {
              fieldType = 'checkbox';
            }
            
            existingFieldsData.push({
              id: `existing-${index}-${widgetIndex}`,
              name: fieldName,
              type: fieldType,
              x,
              y,
              width,
              height,
              pageIndex,
              isExisting: true,
            });
          }
        });
      });
      
      setExistingFields(existingFieldsData);
    } catch (error) {
      console.error('Error extracting existing fields:', error);
      setExistingFields([]);
    }
  }, []);

  // Function to clear a specific area from the canvas by restoring PDF data
  const clearPreviewArea = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    if (!pdfImageDataRef.current) return;
    
    // Add some padding to ensure we clear the entire area including borders and text
    const padding = 20;
    const clearX = Math.max(0, x - padding);
    const clearY = Math.max(0, y - padding);
    const clearWidth = Math.min(ctx.canvas.width - clearX, width + padding * 2);
    const clearHeight = Math.min(ctx.canvas.height - clearY, height + padding * 2);
    
    try {
      // Get the original PDF data for this specific area
      const originalData = ctx.createImageData(clearWidth, clearHeight);
      const sourceData = pdfImageDataRef.current;
      
      // Copy the original PDF data pixel by pixel for the specific area
      for (let row = 0; row < clearHeight; row++) {
        for (let col = 0; col < clearWidth; col++) {
          const sourceX = clearX + col;
          const sourceY = clearY + row;
          
          if (sourceX < sourceData.width && sourceY < sourceData.height) {
            const sourceIndex = (sourceY * sourceData.width + sourceX) * 4;
            const targetIndex = (row * clearWidth + col) * 4;
            
            originalData.data[targetIndex] = sourceData.data[sourceIndex];     // R
            originalData.data[targetIndex + 1] = sourceData.data[sourceIndex + 1]; // G
            originalData.data[targetIndex + 2] = sourceData.data[sourceIndex + 2]; // B
            originalData.data[targetIndex + 3] = sourceData.data[sourceIndex + 3]; // A
          }
        }
      }
      
      // Put the original data back
      ctx.putImageData(originalData, clearX, clearY);
    } catch (error) {
      console.error('Error clearing preview area:', error);
    }
  }, []);

  const drawPreview = useCallback((ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }, currentScale: number) => {
    // Save canvas state before drawing
    ctx.save();
    
    try {
      const x = Math.min(start.x, end.x) * currentScale;
      const y = Math.min(start.y, end.y) * currentScale;
      const width = Math.abs(end.x - start.x) * currentScale;
      const height = Math.abs(end.y - start.y) * currentScale;
      
      // Clear the previous preview box if it exists
      if (lastPreviewBoxRef.current) {
        clearPreviewArea(ctx, lastPreviewBoxRef.current.x, lastPreviewBoxRef.current.y, 
                        lastPreviewBoxRef.current.width, lastPreviewBoxRef.current.height);
      }
      
      // Store current preview box position for next clear
      lastPreviewBoxRef.current = { x, y, width, height };
      
      // Reset any previous drawing state
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      
      // Draw preview rectangle
      ctx.strokeStyle = drawingMode === 'text' ? '#339af0' : '#51cf66';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed line for preview
      ctx.strokeRect(x, y, width, height);
      
      // Fill with semi-transparent color
      ctx.fillStyle = drawingMode === 'text' ? 'rgba(51, 154, 240, 0.2)' : 'rgba(81, 207, 102, 0.2)';
      ctx.fillRect(x, y, width, height);
      
      // Draw preview text
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(drawingMode === 'text' ? 'Champ texte' : 'Case à cocher', x + 2, y - 4);
    } catch (error) {
      console.error('Error drawing preview:', error);
    } finally {
      // Restore canvas state (this will reset line dash and other properties)
      ctx.restore();
    }
  }, [drawingMode, clearPreviewArea]);

  // Separate function to draw field overlays without re-rendering the PDF
  const drawFieldOverlays = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Save current canvas state
    ctx.save();
    
    try {
      // Clear the entire canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Restore the cached PDF rendering if available
      if (pdfImageDataRef.current) {
        ctx.putImageData(pdfImageDataRef.current, 0, 0);
      }
      
      // Reset drawing state to ensure clean overlay drawing
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      
      // Draw existing fields for this page
      const pageExistingFields = existingFields.filter(f => f.pageIndex === currentPage);
      pageExistingFields.forEach(field => {
        drawField(ctx, field, scale);
      });
      
      // Draw user-created fields for this page
      const pageFields = fields.filter(f => f.pageIndex === currentPage);
      pageFields.forEach(field => {
        drawField(ctx, field, scale);
      });
      
      // Clear the preview box tracking when doing full redraw
      lastPreviewBoxRef.current = null;
      
      // Draw preview if currently drawing
      if (isDrawing && startPos && currentPos) {
        drawPreview(ctx, startPos, currentPos, scale);
      }
    } catch (error) {
      console.error('Error drawing field overlays:', error);
    } finally {
      // Restore canvas state
      ctx.restore();
    }
  }, [fields, existingFields, currentPage, isDrawing, startPos, currentPos, scale, drawField, drawPreview]);

  // Function to draw only the preview box during mouse movement (without full redraw)
  const drawPreviewOnly = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Only draw the preview, don't touch the PDF or existing fields
    drawPreview(ctx, start, end, scale);
  }, [drawPreview, scale]);
  // Separate function to render only the PDF page (without fields)
  const renderPDFPage = useCallback(async (pdfJsDocument: pdfjsLib.PDFDocumentProxy, pageIndex: number) => {
    if (!pdfJsDocument) return;
    
    // Clear the preview box tracking when rendering a new page
    lastPreviewBoxRef.current = null;
    
    try {
      const page = await pdfJsDocument.getPage(pageIndex + 1); // PDF.js uses 1-based indexing
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Calculate scale to fit container
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth - 40; // padding
      const viewport = page.getViewport({ scale: 1 });
      const scaleX = containerWidth / viewport.width;
      const scaleY = (window.innerHeight * 0.7) / viewport.height;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
      
      // Set canvas size
      const scaledViewport = page.getViewport({ scale: newScale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Reset canvas state
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      
      // Cancel any previous render operations
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      
      // Render PDF page
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
      };
      
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      
      // Cache the PDF rendering only after successful render
      try {
        pdfImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (cacheError) {
        console.warn('Failed to cache PDF image data:', cacheError);
        pdfImageDataRef.current = null;
      }
      
      // Restore canvas state
      ctx.restore();
      
      // After PDF renders, draw the field overlays
      drawFieldOverlays();
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
      // Clear cached data on error
      pdfImageDataRef.current = null;
    }
  }, [drawFieldOverlays]);

  // Keep the original renderPage function for backward compatibility
  const renderPage = useCallback(async (pdfJsDocument: pdfjsLib.PDFDocumentProxy, pageIndex: number) => {
    await renderPDFPage(pdfJsDocument, pageIndex);
  }, [renderPDFPage]);

  // Effect to render the page when PDF is loaded
  useEffect(() => {
    if (pdfJsDoc) {
      renderPage(pdfJsDoc, currentPage);
    }
  }, [pdfJsDoc, currentPage, renderPage]);

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      // Clear cached PDF image data
      pdfImageDataRef.current = null;
      // Clear preview box tracking
      lastPreviewBoxRef.current = null;
    };
  }, []);

  const loadPDF = useCallback(async (file: File | null) => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Clear the cached PDF image data when loading a new PDF
      pdfImageDataRef.current = null;
      
      // Load with pdf-lib for form field creation
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdfLibDoc);
      
      // Extract existing form fields
      await extractExistingFields(pdfLibDoc);
      
      // Load with PDF.js for rendering
      const pdfJsDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfJsDoc(pdfJsDocument);
      
      setPdfFile(file);
      setTotalPages(pdfJsDocument.numPages);
      setCurrentPage(0);
      setFields([]);
      
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [extractExistingFields]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setCurrentPos({ x, y });
    
    // Throttle the re-rendering to prevent excessive redraws
    const now = Date.now();
    if (now - lastRenderTimeRef.current > 16) { // Max 60fps
      lastRenderTimeRef.current = now;
      
      // Only draw the preview box, don't touch the PDF or other fields
      drawPreviewOnly(startPos, { x, y });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;
    
    // Clear the preview box since we're done drawing
    if (lastPreviewBoxRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        clearPreviewArea(ctx, lastPreviewBoxRef.current.x, lastPreviewBoxRef.current.y, 
                        lastPreviewBoxRef.current.width, lastPreviewBoxRef.current.height);
      }
      lastPreviewBoxRef.current = null;
    }
    
    const x = Math.min(startPos.x, endX);
    const y = Math.min(startPos.y, endY);
    const width = Math.abs(endX - startPos.x);
    const height = Math.abs(endY - startPos.y);
    
    // For checkboxes, use fixed size
    const fieldWidth = drawingMode === 'checkbox' ? 20 : Math.max(width, 20);
    const fieldHeight = drawingMode === 'checkbox' ? 20 : Math.max(height, 20);
    
    if (fieldWidth > 10 && fieldHeight > 10) {
      const newField: PDFField = {
        id: Date.now().toString(),
        name: '',
        type: drawingMode,
        x,
        y,
        width: fieldWidth,
        height: fieldHeight,
        pageIndex: currentPage,
      };
      
      setCurrentField(newField);
      setFieldName('');
      setShowFieldModal(true);
    }
    
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  const handleFieldSave = () => {
    if (!currentField || !fieldName.trim()) return;
    
    const updatedField = { ...currentField, name: fieldName.trim() };
    setFields(prev => [...prev, updatedField]);
    setShowFieldModal(false);
    setCurrentField(null);
    setFieldName('');
    
    // Re-render the field overlays with new field
    drawFieldOverlays();
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    // Re-render the field overlays without the deleted field
    drawFieldOverlays();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Clear the cached PDF image data when changing pages
    pdfImageDataRef.current = null;
    // Clear preview box tracking
    lastPreviewBoxRef.current = null;
    if (pdfJsDoc) {
      renderPage(pdfJsDoc, newPage);
    }
  };

  const savePDFWithFields = async () => {
    if (!pdfFile || !pdfDoc) return;
    
    try {
      // Create a copy of the PDF document
      const pdfWithFields = await PDFDocument.create();
      
      // Copy all pages from original PDF
      const pages = await pdfWithFields.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => pdfWithFields.addPage(page));
      
      // Add form fields to the PDF
      for (const field of fields) {
        const page = pdfWithFields.getPage(field.pageIndex);
        const { height: pageHeight } = page.getSize();
        
        // Convert coordinates (canvas coordinates are top-left origin, PDF coordinates are bottom-left)
        const pdfY = pageHeight - field.y - field.height;
        
        if (field.type === 'text') {
          // Create text field
          const textField = pdfWithFields.getForm().createTextField(field.name);
          textField.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
        } else if (field.type === 'checkbox') {
          // Create checkbox field
          const checkboxField = pdfWithFields.getForm().createCheckBox(field.name);
          checkboxField.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
        }
      }
      
      // Save the PDF with embedded fields
      const pdfBytes = await pdfWithFields.save();
      
      // Download the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfFile.name.replace('.pdf', '')}-with-fields.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error saving PDF with fields:', error);
    }
  };

  return (
    <Container size="xl">
      <Title order={1} mb="xl">
        Éditeur PDF - Définir les champs de formulaire
      </Title>
      
      <Text size="lg" mb="xl" c="dimmed">
        Téléchargez un PDF et dessinez des zones pour définir les champs de formulaire. Le PDF sera sauvegardé avec les champs intégrés.
      </Text>

      <Alert icon={<IconInfoCircle size={16} />} title="Instructions" mb="lg">
        <Text size="sm">
          1. Téléchargez un fichier PDF<br/>
          2. Sélectionnez le type de champ (texte ou case à cocher)<br/>
          3. Cliquez et glissez sur le PDF pour dessiner la zone du champ<br/>
          4. Donnez un nom au champ<br/>
          5. Sauvegardez le PDF avec les champs intégrés
        </Text>
      </Alert>

      <Paper p="md" mb="xl">
        <Group justify="space-between" mb="md">
          <Group>
            <FileButton
              onChange={loadPDF}
              accept=".pdf"
              disabled={isLoading}
            >
              {(props) => (
                <Button
                  {...props}
                  leftSection={<IconUpload size={16} />}
                  loading={isLoading}
                >
                  Télécharger PDF
                </Button>
              )}
            </FileButton>
            
            {pdfFile && (
              <Badge variant="light" size="lg">
                {pdfFile.name}
              </Badge>
            )}
          </Group>
          
          {fields.length > 0 && (
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={savePDFWithFields}
              variant="filled"
            >
              Sauvegarder PDF avec champs
            </Button>
          )}
        </Group>
        
        {pdfJsDoc && (
          <Group mb="md">
            <div style={{ minWidth: '300px' }}>
              <Text size="sm" fw={500} mb="xs">Type de champ</Text>
              <SegmentedControl
                value={drawingMode}
                onChange={(value) => setDrawingMode(value as 'text' | 'checkbox')}
                size="sm"
                fullWidth
                style={{ minWidth: '280px' }}
                data={[
                  { 
                    value: 'text', 
                    label: '📝 Texte'
                  },
                  { 
                    value: 'checkbox', 
                    label: '☑️ Case à cocher'
                  },
                ]}
              />
            </div>
            
            {totalPages > 1 && (
              <Group>
                <Text size="sm">Page:</Text>
                <Button.Group>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Précédent
                  </Button>
                  <Button size="xs" variant="light" disabled>
                    {currentPage + 1} / {totalPages}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Suivant
                  </Button>
                </Button.Group>
              </Group>
            )}
          </Group>
        )}
      </Paper>

      {pdfJsDoc && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper p="md">
              <div ref={containerRef} style={{ textAlign: 'center' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  style={{
                    border: '1px solid #ccc',
                    cursor: 'crosshair',
                    maxWidth: '100%',
                  }}
                />
              </div>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md">
              <Title order={3} mb="md">
                Champs définis ({fields.length + existingFields.length})
              </Title>
              
              {existingFields.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs" c="orange">
                    Champs existants ({existingFields.length})
                  </Text>
                  <Stack gap="xs" mb="md">
                    {existingFields.map((field) => (
                      <Card key={field.id} p="xs" withBorder style={{ borderColor: '#fd7e14' }}>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500} c="orange">
                              {field.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {field.type === 'text' ? 'Texte' : 'Case à cocher'} - Page {field.pageIndex + 1}
                            </Text>
                          </div>
                          <Badge color="orange" variant="light" size="sm">
                            Existant
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </div>
              )}
              
              {fields.length === 0 && existingFields.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Aucun champ défini. Dessinez des zones sur le PDF pour créer des champs.
                </Text>
              ) : fields.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Aucun nouveau champ créé. Dessinez des zones sur le PDF pour créer des champs.
                </Text>
              ) : (
                <div>
                  <Text size="sm" fw={500} mb="xs" c="blue">
                    Nouveaux champs ({fields.length})
                  </Text>
                  <Stack gap="xs">
                    {fields.map((field) => (
                      <Card key={field.id} p="xs" withBorder>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>
                              {field.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {field.type === 'text' ? 'Texte' : 'Case à cocher'} - Page {field.pageIndex + 1}
                            </Text>
                          </div>
                          <ActionIcon
                            color="red"
                            variant="light"
                            size="sm"
                            onClick={() => handleFieldDelete(field.id)}
                          >
                            <IconTrash size={12} />
                          </ActionIcon>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </div>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      )}

      <Modal
        opened={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        title="Configurer le champ"
      >
        <Stack>
          <TextInput
            label="Nom du champ"
            placeholder="Entrez le nom du champ"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            required
          />
          
          {currentField && (
            <div>
              <Text size="sm" c="dimmed">
                Type: {currentField.type === 'text' ? 'Champ texte' : 'Case à cocher'}
              </Text>
              <Text size="sm" c="dimmed">
                Position: {Math.round(currentField.x)}, {Math.round(currentField.y)}
              </Text>
              <Text size="sm" c="dimmed">
                Taille: {Math.round(currentField.width)} × {Math.round(currentField.height)}
              </Text>
            </div>
          )}
          
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setShowFieldModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleFieldSave}
              disabled={!fieldName.trim()}
            >
              Sauvegarder
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}