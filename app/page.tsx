import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero-section";
import { Gallery } from "@/components/gallery";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation Bar - QuantumBlack/McKinsey Style with Mobile Support */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center">
              <Image src="/sdecky_full_light_bg.png" alt="Sdecky" width={400} height={100} className="h-18 md:h-20 w-auto" priority />
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

      <Footer />
    </main>
  );
}
