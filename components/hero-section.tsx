"use client";

import { useState, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  // After first play, skip entrance animations on revisit (duration=0)
  const [skipAnim, setSkipAnim] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useLayoutEffect(() => {
    if (sessionStorage.getItem("hero-anim-played") === "1") {
      setSkipAnim(true);
    }
    sessionStorage.setItem("hero-anim-played", "1");
  }, []);

  const scrollToGallery = () => {
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background Image with Dark Overlay + Zoom Animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: skipAnim ? 0 : 1.5, ease: "easeOut" }}
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
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 max-w-6xl px-4 md:px-6 space-y-10 md:space-y-14 flex flex-col items-center"
      >
        {/* Main Headline - Fade In from Below */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: skipAnim ? 0 : 0.8, delay: skipAnim ? 0 : 0.3, ease: "easeOut" }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-normal leading-[1.5] tracking-tight text-white"
        >
          <span className="block md:whitespace-nowrap">Craft your story with excellence,</span>
          <span className="block md:whitespace-nowrap">and the world will listen.</span>
        </motion.h1>

        {/* Subheadline - Fade In with Delay */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: skipAnim ? 0 : 0.8, delay: skipAnim ? 0 : 0.5, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light italic leading-relaxed px-4 pt-2"
        >
          Sdecky, an AI agent that crafts slides refined by taste and storytelling.
        </motion.p>

      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        style={{ opacity: ctaOpacity }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: skipAnim ? 0 : 0.6, delay: skipAnim ? 0 : 0.8, ease: "easeOut" }}
        className="absolute bottom-16 md:bottom-20 left-0 right-0 z-10 flex flex-col items-center gap-3"
      >
        <p className="text-sm md:text-base text-white/70 font-light">See what&#39;s possible</p>
        <button
          onClick={scrollToGallery}
          className="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12"
          aria-label="Scroll to gallery"
        >
          <ChevronDown
            className="w-8 h-8 md:w-10 md:h-10 text-white/85 group-hover:text-white transition-colors duration-300"
            strokeWidth={2.5}
          />
        </button>
      </motion.div>
    </section>
  );
}
