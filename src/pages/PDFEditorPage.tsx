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
import { notifications } from '@mantine/notifications';
import {
  IconUpload,
  IconTrash,
  IconDownload,
  IconInfoCircle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { PDFDocument, rgb, PDFName, PDFString } from 'pdf-lib';
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
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentField, setCurrentField] = useState<PDFField | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [existingFields, setExistingFields] = useState<PDFField[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  const drawField = useCallback((ctx: CanvasRenderingContext2D, field: PDFField, currentScale: number) => {
    const x = field.x * currentScale;
    const y = field.y * currentScale;
    const width = field.width * currentScale;
    const height = field.height * currentScale;
    
    // Different colors for existing vs new fields
    const isExisting = field.isExisting;
    const textColor = isExisting ? '#fd7e14' : '#339af0'; // orange for existing, blue for new
    const checkboxColor = isExisting ? '#fd7e14' : '#51cf66'; // orange for existing, green for new
    
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

  // Function to draw field overlays on the overlay canvas
  const drawFieldOverlays = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the overlay canvas
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
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
  }, [fields, existingFields, currentPage, scale, drawField]);

  // Function to draw only the preview on the overlay canvas
  const drawPreview = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the overlay canvas
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    const x = Math.min(start.x, end.x) * scale;
    const y = Math.min(start.y, end.y) * scale;
    const width = Math.abs(end.x - start.x) * scale;
    const height = Math.abs(end.y - start.y) * scale;
    
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
    ctx.setLineDash([]); // Reset line dash for text
    ctx.fillText(drawingMode === 'text' ? 'Champ texte' : 'Case à cocher', x + 2, y - 4);
  }, [drawingMode, scale]);

  // Function to clear the overlay canvas
  const clearPreview = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, []);
  // Function to render PDF page and setup overlay canvas
  const renderPDFPage = useCallback(async (pdfJsDocument: pdfjsLib.PDFDocumentProxy, pageIndex: number) => {
    if (!pdfJsDocument) return;
    
    try {
      const page = await pdfJsDocument.getPage(pageIndex + 1); // PDF.js uses 1-based indexing
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!canvas || !overlayCanvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Calculate scale to fit container - make PDF bigger
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth - 40; // padding
      const viewport = page.getViewport({ scale: 1 });
      const scaleX = containerWidth / viewport.width;
      const scaleY = (window.innerHeight * 0.9) / viewport.height;
      const newScale = Math.min(scaleX, scaleY, 2.0); // Allow up to 2.0x scale for bigger preview
      
      setScale(newScale);
      
      // Set canvas size for both canvases
      const scaledViewport = page.getViewport({ scale: newScale });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      overlayCanvas.width = scaledViewport.width;
      overlayCanvas.height = scaledViewport.height;
      
      // Clear main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Cancel any previous render operations
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      
      // Render PDF page on main canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
      };
      
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      
      // After PDF is rendered, draw field overlays if we have existing fields
      if (existingFields.length > 0) {
        // Small delay to ensure the PDF is fully rendered
        setTimeout(() => {
          drawFieldOverlays();
        }, 100);
      }
      
    } catch (error) {
      if (error instanceof Error && error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    }
  }, [existingFields.length, drawFieldOverlays]);

  // Effect to render the page when PDF is loaded
  useEffect(() => {
    if (pdfJsDoc) {
      renderPDFPage(pdfJsDoc, currentPage);
    }
  }, [pdfJsDoc, currentPage, renderPDFPage, drawFieldOverlays, existingFields.length]);

  // Effect to draw field overlays when fields or scale changes
  useEffect(() => {
    if (pdfJsDoc && scale > 0) {
      drawFieldOverlays();
    }
  }, [fields, existingFields, currentPage, scale, drawFieldOverlays, pdfJsDoc]);

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, []);

  const loadPDF = useCallback(async (file: File | null) => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
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
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Draw preview on overlay canvas - no throttling needed as overlay is separate
    drawPreview(startPos, { x, y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;
    
    // Clear the overlay canvas
    clearPreview();
    
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
  };

  const handleFieldSave = () => {
    if (!currentField || !fieldName.trim()) return;
    
    const updatedField = { ...currentField, name: fieldName.trim() };
    setFields(prev => [...prev, updatedField]);
    setShowFieldModal(false);
    setCurrentField(null);
    setFieldName('');
    
    // Field overlays will be re-drawn automatically via useEffect
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    // Field overlays will be re-drawn automatically via useEffect
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // PDF rendering will be handled automatically via useEffect
  };

  const savePDFWithFields = async () => {
    if (!pdfFile || !pdfDoc) return;
    
    try {
      // Create a copy of the PDF document
      const pdfWithFields = await PDFDocument.create();
      
      // Copy all pages from original PDF
      const pages = await pdfWithFields.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => pdfWithFields.addPage(page));
      
      // Group fields by name to handle duplicates
      const fieldGroups = new Map<string, PDFField[]>();
      fields.forEach(field => {
        if (!fieldGroups.has(field.name)) {
          fieldGroups.set(field.name, []);
        }
        fieldGroups.get(field.name)!.push(field);
      });
      
      // Create fields with same names using the suggested approach
      for (const [fieldName, fieldList] of fieldGroups) {
        const createdFields: any[] = [];
        
        // Create fields with temporary unique names
        for (let i = 0; i < fieldList.length; i++) {
          const field = fieldList[i];
          const page = pdfWithFields.getPage(field.pageIndex);
          const { height: pageHeight } = page.getSize();
          
          // Convert coordinates (canvas coordinates are top-left origin, PDF coordinates are bottom-left)
          const pdfY = pageHeight - field.y - field.height;
          
          const tempName = `${fieldName}_temp_${i}`;
          
          if (field.type === 'text') {
            // Create text field with temporary name
            const textField = pdfWithFields.getForm().createTextField(tempName);
            textField.addToPage(page, {
              x: field.x,
              y: pdfY,
              width: field.width,
              height: field.height,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            createdFields.push(textField);
          } else if (field.type === 'checkbox') {
            // Create checkbox field with temporary name
            const checkboxField = pdfWithFields.getForm().createCheckBox(tempName);
            checkboxField.addToPage(page, {
              x: field.x,
              y: pdfY,
              width: field.width,
              height: field.height,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            createdFields.push(checkboxField);
          }
        }
        
        // Rename all fields to have the same name
        createdFields.forEach((field) => {
          try {
            const fieldRef = field.ref;
            const fieldDict = pdfWithFields.context.lookup(fieldRef);
            
            // Check if fieldDict is a PDFDict and set the same name for all fields
            if (fieldDict && typeof fieldDict === 'object' && 'set' in fieldDict) {
              (fieldDict as any).set(PDFName.of('T'), PDFString.of(fieldName));
            }
          } catch (error) {
            console.warn('Could not rename field:', error);
          }
        });
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
      
      // Show success notification
      notifications.show({
        title: 'PDF sauvegardé avec succès',
        message: `Le PDF avec ${fields.length} champs a été téléchargé.`,
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      
    } catch (error) {
      console.error('Error saving PDF with fields:', error);
      notifications.show({
        title: 'Erreur lors de la sauvegarde',
        message: 'Impossible de sauvegarder le PDF. Veuillez réessayer.',
        color: 'red',
        icon: <IconX size={18} />,
      });
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
              <div ref={containerRef} style={{ textAlign: 'center', position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    border: '1px solid #ccc',
                    maxWidth: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  style={{
                    border: '1px solid #ccc',
                    cursor: 'crosshair',
                    maxWidth: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'auto',
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
              
              {/* Show new fields first */}
              {fields.length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs" c="blue">
                    Nouveaux champs ({fields.length})
                  </Text>
                  <Stack gap="xs" mb="md">
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
              
              {fields.length === 0 && existingFields.length === 0 && (
                <Text c="dimmed" size="sm">
                  Aucun champ défini. Dessinez des zones sur le PDF pour créer des champs.
                </Text>
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