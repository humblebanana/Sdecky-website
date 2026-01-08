"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const scrollToGallery = () => {
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-background.jpg"
          alt="Background"
          fill
          className="object-cover brightness-[0.35]"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl px-4 md:px-6 space-y-6 md:space-y-8">
        {/* Main Headline - Serif Font, Responsive Size */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal leading-tight text-white">
          Every great idea deserves a{" "}
          <span className="text-[#2251FF]">professional</span>{" "}
          presentation
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed px-4">
Sdecky, an AI agent that crafts slides refined by taste and storytelling      </p>
        {/* Large Scroll Down CTA */}
        <div className="flex flex-col items-center gap-3 pt-8 md:pt-12">
          <p className="text-sm md:text-base text-white/70 font-light">See what's possible</p>
          <button
            onClick={scrollToGallery}
            className="group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#2251FF] hover:bg-white transition-colors duration-300"
            aria-label="Scroll to gallery"
          >
            <ChevronDown className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:text-[#051C2C] transition-colors duration-300" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
