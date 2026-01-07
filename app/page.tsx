import Link from "next/link";
import { Hero } from "@/components/hero-section";
import { Gallery } from "@/components/gallery";
import { MobileNav } from "@/components/mobile-nav";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Fixed Navigation Bar - QuantumBlack/McKinsey Style with Mobile Support */}
      <nav className="fixed top-0 w-full bg-white border-b border-[#E0E0E0] z-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo Section */}
            <Link href="/" className="flex flex-col">
              <span className="text-2xl md:text-4xl font-serif font-bold text-[#051C2C]">
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
                  className="relative text-lg text-[#051C2C] hover:text-[#2251FF] transition-colors pb-1 group"
                >
                  Join Waitlist
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2251FF] group-hover:w-full transition-all duration-300"></span>
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
      <footer className="w-full border-t border-[#F0F0F0] py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-[#5A6780]">
          <p>&copy; 2025 Sdecky. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
