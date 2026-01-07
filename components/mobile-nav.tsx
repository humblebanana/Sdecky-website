"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-[#051C2C] hover:text-[#2251FF] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-20 right-0 w-64 bg-white border-l border-b border-[#E0E0E0] shadow-2xl z-50 md:hidden">
            <nav className="flex flex-col p-6 space-y-6">
              {/* Category Label */}
              <div className="text-xs font-medium text-[#5A6780] uppercase tracking-wide">
                Professional Presentation Tools
              </div>

              {/* Navigation Links */}
              <Link
                href="/gallery"
                onClick={() => setIsOpen(false)}
                className="text-base text-[#051C2C] hover:text-[#2251FF] transition-colors py-2 border-b border-[#F0F0F0]"
              >
                Gallery
              </Link>
              <Link
                href="/waitlist"
                onClick={() => setIsOpen(false)}
                className="text-base text-[#051C2C] hover:text-[#2251FF] transition-colors py-2"
              >
                Join Waitlist
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
