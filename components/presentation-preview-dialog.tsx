"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PresentationPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  onDownload?: () => void;
}

export function PresentationPreviewDialog({
  isOpen,
  onClose,
  title,
  pdfUrl,
  onDownload,
}: PresentationPreviewDialogProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    const loadPDF = async () => {
      setLoading(true);
      setPageImages([]);
      try {
        // Dynamically import pdfjs-dist only on client side
        const pdfjsLib = await import("pdfjs-dist");

        // Set worker source to local file
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        // Fetch PDF as ArrayBuffer to handle CORS for Supabase Storage
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        // Render pages progressively - show first page immediately
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
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

          // Update state progressively
          setPageImages((prev) => [...prev, imageData]);

          // Show first page immediately
          if (pageNum === 1) {
            setLoading(false);
            setCurrentPage(0);
          }
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPDF();
  }, [isOpen, pdfUrl]);

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
      <div className="relative bg-white rounded-lg shadow-2xl w-[80vw] h-[80vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
          <h2 className="text-xl md:text-2xl font-serif text-[#051C2C]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F0F0F0] rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-[#5A6780]" />
          </button>
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
            <div className="flex items-center justify-center h-full">
              <p className="text-[#5A6780]">Failed to load presentation</p>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {!loading && pageImages.length > 0 && (
          <div className="border-t border-[#E0E0E0] bg-white">
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
