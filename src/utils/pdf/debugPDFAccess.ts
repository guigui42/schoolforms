/**
 * Debug version of PDF Form Filler for troubleshooting
 */

// Simple test to check if we can fetch a PDF file
export async function debugPDFAccess(): Promise<void> {
  const testPaths = [
    '/templates/test-periscolaire.pdf',
    '/templates/test-edpp.pdf',
    '/public/templates/test-periscolaire.pdf',
    '/public/templates/test-edpp.pdf'
  ];

  console.log('=== PDF Access Debug Test ===');
  
  for (const path of testPaths) {
    console.log(`\n--- Testing path: ${path} ---`);
    
    try {
      const response = await fetch(path);
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        console.log(`Buffer size: ${buffer.byteLength} bytes`);
        
        // Check first few bytes
        const firstBytes = new Uint8Array(buffer.slice(0, 20));
        const firstBytesStr = Array.from(firstBytes).map(b => String.fromCharCode(b)).join('');
        console.log(`First 20 bytes: "${firstBytesStr}"`);
        console.log(`Is PDF: ${firstBytesStr.startsWith('%PDF-')}`);
        
        if (!firstBytesStr.startsWith('%PDF-')) {
          console.log('❌ Not a valid PDF - likely getting HTML response');
        } else {
          console.log('✅ Valid PDF file');
        }
      } else {
        console.log(`❌ HTTP Error: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Fetch Error: ${error}`);
    }
  }
  
  console.log('\n=== Debug Test Complete ===');
}

// Add to window for manual testing
declare global {
  interface Window {
    debugPDFAccess?: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.debugPDFAccess = debugPDFAccess;
  console.log('Debug function loaded. Run debugPDFAccess() in console to test.');
}
