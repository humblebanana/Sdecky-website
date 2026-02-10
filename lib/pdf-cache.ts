// Global in-memory cache for rendered PDF page images
// Key: pdfUrl, Value: array of JPEG data URL strings

const cache = new Map<string, string[]>();
const cacheComplete = new Map<string, boolean>();
const pendingPreloads = new Map<string, Promise<void>>();

export function getCachedPages(pdfUrl: string): string[] | null {
  return cache.get(pdfUrl) ?? null;
}

export function isCacheComplete(pdfUrl: string): boolean {
  return cacheComplete.get(pdfUrl) ?? false;
}

export function setCachedPages(pdfUrl: string, pages: string[]): void {
  cache.set(pdfUrl, pages);
  cacheComplete.set(pdfUrl, true);
}

/**
 * Preload a PDF's first page in the background (for hover preloading).
 * If the PDF is already cached or being preloaded, this is a no-op.
 */
export function preloadFirstPage(pdfUrl: string): void {
  if (cache.has(pdfUrl) || pendingPreloads.has(pdfUrl)) return;

  const promise = (async () => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const response = await fetch(pdfUrl);
      if (!response.ok) return;
      const arrayBuffer = await response.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      const imageData = canvas.toDataURL("image/jpeg", 0.95);

      // Only set if not already cached with more pages
      if (!cache.has(pdfUrl)) {
        cache.set(pdfUrl, [imageData]);
        cacheComplete.set(pdfUrl, false);
      }
    } catch {
      // Silently fail for preloading
    } finally {
      pendingPreloads.delete(pdfUrl);
    }
  })();

  pendingPreloads.set(pdfUrl, promise);
}
