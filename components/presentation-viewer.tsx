"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Check,
} from "lucide-react";
import { getCachedPages, isCacheComplete, setCachedPages } from "@/lib/pdf-cache";

interface PresentationViewerProps {
  id: string;
  title: string;
  description?: string;
  pdfUrl: string;
  isFree: boolean;
}

export function PresentationViewer({
  id,
  title,
  description,
  pdfUrl,
  isFree,
}: PresentationViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!pdfUrl) return;
    let isCancelled = false;

    const loadPDF = async () => {
      setCurrentPage(0);
      setError(null);

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

        // Fetch PDF with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
          const viewport = page.getViewport({ scale: 2.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const imageData = canvas.toDataURL("image/jpeg", 0.95);
          if (isCancelled) return;
          renderedImages.push(imageData);
          setPageImages([...renderedImages]);
          if (pageNum === 1 && !hasCached) setLoading(false);
        }

        // Write to cache after all pages rendered
        if (!isCancelled) {
          setCachedPages(pdfUrl, renderedImages);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        if (!isCancelled) {
          let errorMessage = "Unknown error";
          if (err instanceof Error) {
            if (err.name === "AbortError") {
              errorMessage = "PDF loading timed out. The file may be too large or the connection is slow.";
            } else {
              errorMessage = err.message;
            }
          }
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    loadPDF();
    return () => { isCancelled = true; };
  }, [pdfUrl, isFree]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentPage((prev) =>
          Math.min(pageImages.length > 0 ? pageImages.length - 1 : 0, prev + 1)
        );
      }
    },
    [pageImages.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const current = thumbRefs.current[currentPage];
    if (current) {
      current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentPage, pageImages.length]);

  const handlePrevious = () => {
    if (isNavigating || pageImages.length === 0) return;
    setIsNavigating(true);
    setCurrentPage((prev) => Math.max(0, prev - 1));
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleNext = () => {
    if (isNavigating || pageImages.length === 0) return;
    setIsNavigating(true);
    setCurrentPage((prev) => Math.min(pageImages.length - 1, prev + 1));
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/presentations/${id}`;
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

  return (
    <div className="h-screen bg-[#F0F0F0] flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E0E0E0] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center">
          <Image
            src="/sdecky_full_light_bg.png"
            alt="Sdecky"
            width={400}
            height={100}
            className="h-12 md:h-16 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
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
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            className="p-2 hover:bg-[#F0F0F0] rounded-sm transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-[#5A6780]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 md:p-8">
        {loading ? (
          <p className="text-[#5A6780]">Loading presentation...</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <p className="text-[#5A6780] text-lg">Failed to load presentation</p>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-2xl">
              <p className="text-sm text-red-800 font-mono">{error}</p>
            </div>
          </div>
        ) : pageImages.length > 0 ? (
          <>
            <img
              src={pageImages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
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
        ) : null}
      </div>

      {/* Thumbnail Navigation */}
      {!loading && pageImages.length > 0 && (
        <div className="border-t border-[#E0E0E0] bg-white shrink-0">
          {!isFree && (
            <div className="px-6 py-3 bg-[#051C2C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">Preview Locked</span>
              </div>
              <span className="text-xs text-white/80">
                Only showing {pageImages.length} pages of the full presentation
              </span>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
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
              <span className="text-sm text-[#5A6780] shrink-0 pl-2">
                Page {currentPage + 1} of {pageImages.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* "Made with Sdecky" floating badge - bottom right */}
      <Link
        href="/"
        className="fixed bottom-6 right-6 flex items-center gap-3 bg-[#123146] text-white pl-3 pr-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:bg-[#1a4461] transition-all duration-300 ease-out z-10 group"
      >
        <Image
          src="/logo_icon_v2 (1).png"
          alt="Sdecky"
          width={32}
          height={32}
          className="rounded-full group-hover:rotate-12 transition-transform duration-300"
        />
        <span className="text-sm font-serif font-medium">Crafted with Sdecky</span>
      </Link>
    </div>
  );
}
