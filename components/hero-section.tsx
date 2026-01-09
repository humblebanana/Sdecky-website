"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const scrollToGallery = () => {
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image with Dark Overlay + Zoom Animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/hero-background.jpg"
          alt="Background"
          fill
          className="object-cover brightness-[0.35]"
          priority
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl px-4 md:px-6 space-y-6 md:space-y-8">
        {/* Main Headline - Fade In from Below */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal leading-tight text-white"
        >
          Every great idea deserves a{" "}
          <span className="text-[#2251FF]">professional</span>{" "}
          presentation.
        </motion.h1>

        {/* Subheadline - Fade In with Delay */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed px-4"
        >
          Sdecky, an AI agent that crafts slides refined by taste and storytelling.
        </motion.p>

        {/* Large Scroll Down CTA - Scale In + Breathing Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 pt-8 md:pt-12"
        >
          <p className="text-sm md:text-base text-white/70 font-light">See what's possible</p>
          <motion.button
            onClick={scrollToGallery}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#2251FF] hover:bg-white transition-colors duration-300 shadow-lg"
            aria-label="Scroll to gallery"
          >
            <ChevronDown className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:text-[#051C2C] transition-colors duration-300" strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
