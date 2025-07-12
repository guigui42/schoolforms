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
  Select,
  TextInput,
  Modal,
  Card,
  Badge,
  ActionIcon,
  Grid,
  Alert,
} from '@mantine/core';
import {
  IconUpload,
  IconSquare,
  IconCheckbox,
  IconTrash,
  IconDownload,
  IconInfoCircle,
} from '@tabler/icons-react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFField {
  id: string;
  name: string;
  type: 'text' | 'checkbox';
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawField = (ctx: CanvasRenderingContext2D, field: PDFField, currentScale: number) => {
    const x = field.x * currentScale;
    const y = field.y * currentScale;
    const width = field.width * currentScale;
    const height = field.height * currentScale;
    
    // Draw field box
    ctx.strokeStyle = field.type === 'text' ? '#339af0' : '#51cf66';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Fill with semi-transparent color
    ctx.fillStyle = field.type === 'text' ? 'rgba(51, 154, 240, 0.1)' : 'rgba(81, 207, 102, 0.1)';
    ctx.fillRect(x, y, width, height);
    
    // Draw field name
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(field.name, x + 2, y - 4);
  };

  const renderPage = useCallback(async (pdfJsDocument: pdfjsLib.PDFDocumentProxy, pageIndex: number) => {
    if (!pdfJsDocument) return;
    
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
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render PDF page
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport,
      };
      
      await page.render(renderContext).promise;
      
      // Draw existing fields for this page
      const pageFields = fields.filter(f => f.pageIndex === pageIndex);
      pageFields.forEach(field => {
        drawField(ctx, field, newScale);
      });
      
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [fields]);

  // Effect to render the page when PDF is loaded
  useEffect(() => {
    if (pdfJsDoc) {
      renderPage(pdfJsDoc, currentPage);
    }
  }, [pdfJsDoc, currentPage, renderPage]);

  const loadPDF = useCallback(async (file: File | null) => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load with pdf-lib for form field creation
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(pdfLibDoc);
      
      // Load with PDF.js for rendering
      const pdfJsDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfJsDoc(pdfJsDocument);
      
      setPdfFile(file);
      setTotalPages(pdfJsDocument.numPages);
      setCurrentPage(0);
      setFields([]);
      
      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        renderPage(pdfJsDocument, 0);
      }, 100);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [renderPage]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / scale;
    const endY = (e.clientY - rect.top) / scale;
    
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
    
    // Re-render the page with new field
    if (pdfJsDoc) {
      renderPage(pdfJsDoc, currentPage);
    }
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (pdfJsDoc) {
      renderPage(pdfJsDoc, currentPage);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
            <Select
              label="Type de champ"
              value={drawingMode}
              onChange={(value) => setDrawingMode(value as 'text' | 'checkbox')}
              data={[
                { value: 'text', label: 'Champ texte' },
                { value: 'checkbox', label: 'Case à cocher' },
              ]}
              leftSection={drawingMode === 'text' ? <IconSquare size={16} /> : <IconCheckbox size={16} />}
            />
            
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
                Champs définis ({fields.length})
              </Title>
              
              {fields.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Aucun champ défini. Dessinez des zones sur le PDF pour créer des champs.
                </Text>
              ) : (
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