"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Maximize2, Share2, Check } from "lucide-react";
import { getCachedPages, isCacheComplete, setCachedPages } from "@/lib/pdf-cache";

interface PresentationPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  presentationId: string;
  title: string;
  pdfUrl: string;
  isFree: boolean;
  onDownload?: () => void;
}

export function PresentationPreviewDialog({
  isOpen,
  onClose,
  presentationId,
  title,
  pdfUrl,
  isFree,
  onDownload,
}: PresentationPreviewDialogProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleShareLink = async () => {
    const url = `${window.location.origin}/presentations/${presentationId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isCancelled = false;

    const loadPDF = async () => {
      setCurrentPage(0);
      setError(null);
      setLoadingStatus("Loading...");

      // Check cache first
      const cached = getCachedPages(pdfUrl);
      const hasCached = !!(cached && cached.length > 0);
      const cachedComplete = isCacheComplete(pdfUrl);

      if (hasCached) {
        setPageImages(cached);
        setLoading(false);
        if (cachedComplete) {
          return;
        }
      } else {
        setLoading(true);
        setPageImages([]);
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        // Fetch PDF with timeout - use simple arrayBuffer() for speed
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

        const response = await fetch(pdfUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (isCancelled) return;

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const pagesToRender = isFree ? numPages : Math.ceil(numPages / 2);

        const renderedImages: string[] = hasCached
          ? cached!.slice(0, pagesToRender)
          : [];

        if (hasCached && renderedImages.length !== cached!.length) {
          setPageImages([...renderedImages]);
        }

        for (let pageNum = renderedImages.length + 1; pageNum <= pagesToRender; pageNum++) {
          if (isCancelled) return;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          const imageData = canvas.toDataURL("image/jpeg", 0.85);

          if (isCancelled) return;

          renderedImages.push(imageData);
          setPageImages([...renderedImages]);

          if (pageNum === 1 && !hasCached) {
            setLoading(false);
          }
        }

        // Write to cache after all pages rendered
        if (!isCancelled) {
          setCachedPages(pdfUrl, renderedImages);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        if (!isCancelled) {
          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            if (error.name === "AbortError") {
              errorMessage = "PDF loading timed out after 20 seconds. The file may be too large or the connection is slow.";
            } else {
              errorMessage = error.message;
            }
          }
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
        setCurrentPage((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPage((prev) => {
          // Only allow navigation if pages are loaded
          const maxPage = pageImages.length > 0 ? pageImages.length - 1 : 0;
          return Math.min(maxPage, prev + 1);
        });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pageImages.length, onClose]);

  useEffect(() => {
    const current = thumbRefs.current[currentPage];
    if (current) {
      current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentPage, pageImages.length]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    if (isNavigating || pageImages.length === 0) return;
    setIsNavigating(true);
    setCurrentPage((prev) => Math.max(0, prev - 1));
    // Reset navigation lock after a short delay
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleNext = () => {
    // Only allow navigation if pages are loaded and not currently navigating
    if (isNavigating || pageImages.length === 0) return;
    setIsNavigating(true);
    setCurrentPage((prev) => Math.min(pageImages.length - 1, prev + 1));
    // Reset navigation lock after a short delay
    setTimeout(() => setIsNavigating(false), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl flex flex-col w-[80vw] h-[80vh] max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
          <h2 className="text-xl md:text-2xl font-serif text-[#051C2C] truncate flex-1 mr-4">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="p-2 hover:bg-[#F0F0F0] rounded-sm transition-colors flex items-center gap-1.5"
              title="Copy link"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Share2 className="w-5 h-5 text-[#5A6780]" />
              )}
              <span className="hidden sm:inline text-sm text-[#5A6780]">
                {copied ? "Copied!" : "Share"}
              </span>
            </button>
            <button
              onClick={() => router.push(`/presentations/${presentationId}`)}
              className="p-2 hover:bg-[#F0F0F0] rounded-sm transition-colors"
              title="Open full page"
            >
              <Maximize2 className="w-5 h-5 text-[#5A6780]" />
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
        <div className="flex-1 overflow-hidden bg-[#F0F0F0] relative min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-[#2251FF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#5A6780]">{loadingStatus}</p>
            </div>
          ) : pageImages.length > 0 ? (
            <>
              {/* Current Page */}
              <div className="flex items-center justify-center h-full p-8">
                {pageImages[currentPage] ? (
                  <img
                    src={pageImages[currentPage]}
                    alt={`Page ${currentPage + 1}`}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    <p className="text-[#5A6780]">Loading page...</p>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {pageImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0 || isNavigating}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-[#F0F0F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#051C2C]" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === pageImages.length - 1 || isNavigating}
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
                    ref={(el) => {
                      thumbRefs.current[index] = el;
                    }}
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
            className="px-6 py-2.5 bg-[#2251FF] text-white hover:bg-[#051C2C] transition-colors rounded-sm"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </div>
  );
}
