"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface PresentationPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  isFree: boolean;
  onDownload?: () => void;
}

export function PresentationPreviewDialog({
  isOpen,
  onClose,
  title,
  pdfUrl,
  isFree,
  onDownload,
}: PresentationPreviewDialogProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mobile devices default to fullscreen
  const [isFullscreen, setIsFullscreen] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isCancelled = false;

    const loadPDF = async () => {
      setLoading(true);
      setPageImages([]);
      setCurrentPage(0);
      setError(null);

      try {
        // Dynamically import pdfjs-dist only on client side
        const pdfjsLib = await import("pdfjs-dist");

        // Set worker source - use jsDelivr CDN (China-friendly, global CDN)
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        console.log('[Preview] Loading PDF:', pdfUrl);
        console.log('[Preview] PDF.js version:', pdfjsLib.version);
        console.log('[Preview] Worker URL:', pdfjsLib.GlobalWorkerOptions.workerSrc);

        // Fetch PDF as ArrayBuffer to handle CORS for Supabase Storage
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          console.error('[Preview] Fetch failed:', response.status, response.statusText);
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log('[Preview] PDF fetched, size:', arrayBuffer.byteLength);

        if (isCancelled) return;

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        console.log('[Preview] PDF loaded, pages:', numPages);

        // Determine how many pages to show based on is_free
        const pagesToRender = isFree ? numPages : Math.ceil(numPages / 2);

        const renderedImages: string[] = [];

        // Render pages progressively - show first page immediately
        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
          if (isCancelled) return;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 }); // Reduced scale for faster loading
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas, // Required by pdfjs-dist type definition
          }).promise;

          const imageData = canvas.toDataURL("image/jpeg", 0.85); // JPEG with compression

          if (isCancelled) return;

          renderedImages.push(imageData);

          // Update state progressively
          setPageImages([...renderedImages]);

          // Show first page immediately
          if (pageNum === 1) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (!isCancelled) {
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, pdfUrl, isFree]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, pageImages.length, isFullscreen]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(pageImages.length - 1, prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative bg-white rounded-lg shadow-2xl flex flex-col ${
        isFullscreen
          ? 'w-[98vw] h-[98vh]'
          : 'w-[80vw] h-[80vh] max-w-6xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
          <h2 className="text-xl md:text-2xl font-serif text-[#051C2C] truncate flex-1 mr-4">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-[#F0F0F0] rounded-sm transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-[#5A6780]" />
              ) : (
                <Maximize2 className="w-5 h-5 text-[#5A6780]" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F0F0F0] rounded-sm transition-colors"
            >
              <X className="w-5 h-5 text-[#5A6780]" />
            </button>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 overflow-hidden bg-[#F0F0F0] relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#5A6780]">Loading presentation...</p>
            </div>
          ) : pageImages.length > 0 ? (
            <>
              {/* Current Page */}
              <div className="flex items-center justify-center h-full p-8">
                <img
                  src={pageImages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              </div>

              {/* Navigation Arrows */}
              {pageImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-[#F0F0F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#051C2C]" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === pageImages.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-[#F0F0F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-6 h-6 text-[#051C2C]" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <p className="text-[#5A6780] text-lg">Failed to load presentation</p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-2xl">
                  <p className="text-sm text-red-800 font-mono">{error}</p>
                </div>
              )}
              <p className="text-sm text-[#5A6780]">
                Please check the browser console for more details
              </p>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {!loading && pageImages.length > 0 && (
          <div className="border-t border-[#E0E0E0] bg-white">
            {/* Locked Notice */}
            {!isFree && (
              <div className="px-6 py-3 bg-[#051C2C] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium">Preview Locked</span>
                </div>
                <span className="text-xs text-white/80">Only showing {pageImages.length} pages of the full presentation</span>
              </div>
            )}

            <div className="p-4">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {pageImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`flex-shrink-0 border-2 rounded-sm transition-all ${
                      currentPage === index
                        ? "border-[#2251FF] ring-2 ring-[#2251FF]/20"
                        : "border-[#E0E0E0] hover:border-[#051C2C]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-32 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E0E0E0] bg-white">
          <div className="text-sm text-[#5A6780]">
            {!loading && pageImages.length > 0 && (
              <span>
                Page {currentPage + 1} of {pageImages.length}
              </span>
            )}
          </div>
          <a
            href="/waitlist"
            className="px-6 py-2.5 bg-[#051C2C] text-white hover:bg-[#051C2C]/90 transition-colors rounded-sm"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </div>
  );
}
