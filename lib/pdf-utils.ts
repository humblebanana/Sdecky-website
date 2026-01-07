/**
 * PDF utilities for thumbnail generation using PDF.js
 * This code runs in the browser to extract the first page of a PDF as an image.
 */

/**
 * Generate a thumbnail image from the first page of a PDF file.
 *
 * @param file - The PDF file
 * @param pageNumber - The page number to extract (default: 1)
 * @param scale - Scale factor for quality (default: 2)
 * @returns A Blob containing the PNG image
 */
export async function generateThumbnailFromPDF(
  file: File,
  pageNumber: number = 1,
  scale: number = 2
): Promise<Blob> {
  // Dynamically import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source - using local worker file from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  // Get the specified page
  const page = await pdf.getPage(pageNumber);

  // Calculate viewport
  const viewport = page.getViewport({ scale });

  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas 2D context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page to canvas
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;

  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Get the number of pages in a PDF file.
 *
 * @param file - The PDF file
 * @returns The number of pages
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const pdfjsLib = await import('pdfjs-dist');

  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  return pdf.numPages;
}

/**
 * Validate that a file is a valid PDF.
 *
 * @param file - The file to validate
 * @returns true if valid PDF, false otherwise
 */
export async function isValidPDF(file: File): Promise<boolean> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    await loadingTask.promise;

    return true;
  } catch (error) {
    console.error('PDF validation error:', error);
    return false;
  }
}
