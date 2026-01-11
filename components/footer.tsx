import Link from "next/link";
import { Globe, Zap, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E0E0E0]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 py-16 md:py-20">
          {/* Left Section - Brand & Description */}
          <div className="bg-[#051C2C] p-8 md:p-12 rounded-sm">
            <div className="space-y-8">
              {/* Logo */}
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
                Sdecky
              </h2>

              {/* Divider */}
              <div className="w-full h-px bg-white/20"></div>

              {/* Tagline */}
              <p className="text-lg md:text-xl text-white/90 italic font-light leading-relaxed">
                "Every great idea deserves a professional presentation"
              </p>

              {/* Description */}
              <p className="text-base text-white/80 font-light leading-relaxed">
                Sdecky is an AI agent that crafts slides refined by taste and storytelling.
                We bridge the gap between raw data and compelling narratives, ensuring your
                ideas resonate with professional elegance.
              </p>
            </div>
          </div>

          {/* Right Section - Information Grid */}
          <div className="space-y-8">
            {/* Website & Learn More */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#051C2C] flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-normal text-[#051C2C] mb-2">
                  Website & Learn More
                </h3>
                <a
                  href="https://www.sdecky.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5A6780] hover:text-[#2251FF] transition-colors"
                >
                  https://www.sdecky.ai/
                </a>
              </div>
            </div>

            {/* Philosophy */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#051C2C] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-normal text-[#051C2C] mb-2">
                  Philosophy
                </h3>
                <p className="text-[#5A6780]">Taste & Storytelling</p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#051C2C] flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-normal text-[#051C2C] mb-2">
                  Contact
                </h3>
                <a
                  href="mailto:humbleguava@gmail.com"
                  className="text-[#5A6780] hover:text-[#2251FF] transition-colors"
                >
                  humbleguava@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F0F0F0] py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5A6780]">
            <p>&copy; 2025 Sdecky AI. Palo Alto, California. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/waitlist" className="hover:text-[#2251FF] transition-colors">
                Join Waitlist
              </Link>
              <Link href="/gallery" className="hover:text-[#2251FF] transition-colors">
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
