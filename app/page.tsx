import Link from "next/link";
import { Mail } from "lucide-react";
import { Hero } from "@/components/hero-section";
import { Gallery } from "@/components/gallery";
import { MobileNav } from "@/components/mobile-nav";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation Bar - QuantumBlack/McKinsey Style with Mobile Support */}
      <nav className="w-full bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <Link href="/" className="flex flex-col">
              <span className="text-2xl md:text-2xl font-serif font-bold text-[#051C2C]">
                Sdecky
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex flex-col items-end">
              {/* Category Label */}

              {/* Navigation Items */}
              <div className="flex gap-8 items-center">
                <Link
                  href="/gallery"
                  className="relative text-lg text-[#051C2C] hover:text-[#2251FF] transition-colors pb-1 group"
                >
                  Gallery
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2251FF] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  href="/waitlist"
                  className="px-6 py-2.5 bg-[#2251FF] text-white hover:bg-[#051C2C] transition-colors rounded-sm text-base font-medium"
                >
                  Join Waitlist
                </Link>
              </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Gallery Section */}
      <Gallery />

      {/* Footer */}
      <footer className="w-full border-t border-[#F0F0F0] py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-sm text-[#5A6780]">
            <p>&copy; 2025 Sdecky AI. Palo Alto, California. All rights reserved.</p>
            <a
              href="mailto:humbleguava@gmail.com"
              className="text-[#2251FF] hover:text-[#051C2C] transition-colors"
              aria-label="Contact us via email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
