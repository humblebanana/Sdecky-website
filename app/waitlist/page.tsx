"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Sparkles, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { CustomRequestForm } from "@/components/custom-request-form";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Scroll animations
  const heroContent = useScrollAnimation();
  const customSection = useScrollAnimation();

  const scrollToCustom = () => {
    const customRequestSection = document.querySelector('section:nth-of-type(2)');
    if (customRequestSection) {
      customRequestSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("waitlist").insert([{ email }]);

      if (error) {
        if (error.code === "23505") {
          setStatus("error");
          setMessage("This email is already on the waitlist.");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("Successfully joined the waitlist!");
        setEmail("");
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Navigation Bar - Same as Homepage */}
      <nav className="w-full bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-18 md:h-20">
            {/* Logo Section */}
            <Link href="/" className="flex flex-col">
              <span className="text-2xl md:text-2xl font-serif font-bold text-[#051C2C]">
                Sdecky
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex flex-col items-end">
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

      {/* Section 1: Hero + Waitlist Form - McKinsey Style */}
      <section className="relative w-full min-h-screen flex items-center justify-center text-center overflow-hidden bg-[#051C2C]">
        <div
          ref={heroContent.ref}
          className={`relative z-10 max-w-4xl px-4 md:px-6 space-y-10 md:space-y-12 scroll-fade-in ${heroContent.isVisible ? 'visible' : ''}`}
        >
          {/* Hero Content */}
          <div className="space-y-6 md:space-y-8">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal leading-tight text-white">
              Be the <span className="text-[#2251FF]">first</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
              Experience professional AI presentations. Join our waitlist for early access.
            </p>
          </div>

          {/* Waitlist Form - Embedded in Hero */}
          <div className="space-y-6 max-w-2xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-14 md:h-16 px-6 text-base md:text-lg bg-white border-white focus:border-[#2251FF] rounded-sm"
                disabled={status === "success"}
              />
              <Button
                type="submit"
                disabled={loading || status === "success"}
                className="h-14 md:h-16 px-8 md:px-10 bg-[#2251FF] hover:bg-white hover:text-[#051C2C] text-white rounded-sm text-base md:text-lg font-medium whitespace-nowrap transition-all"
              >
                {loading
                  ? "Joining..."
                  : status === "success"
                  ? "Joined ✓"
                  : "Join Waitlist →"}
              </Button>
            </form>

            {/* Success/Error Messages */}
            {message && (
              <div className="text-center">
                {status === "success" && (
                  <p className="text-base text-[#2251FF]">{message}</p>
                )}
                {status === "error" && (
                  <p className="text-base text-red-600">{message}</p>
                )}
              </div>
            )}

            {/* Privacy Note */}
            <p className="text-sm text-center text-white/60">
              We respect your privacy. Your email will only be used to notify you about Sdecky's launch.
            </p>
          </div>

          {/* Scroll Down Hint - Custom Request */}
          <div className="flex flex-col items-center gap-3 pt-8 md:pt-12">
            <p className="text-sm md:text-base text-white/70 font-light">Need a custom presentation?</p>
            <button
              onClick={scrollToCustom}
              className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white/40 hover:border-white hover:bg-white/10 transition-all duration-300"
              aria-label="Scroll to custom request"
            >
              <ChevronDown className="w-6 h-6 md:w-7 md:h-7 text-white/70 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Custom Request - White Background for Contrast */}
      <section className="w-full min-h-screen flex items-center justify-center bg-white py-20 md:py-32">
        <div
          ref={customSection.ref}
          className={`container px-4 md:px-8 lg:px-12 mx-auto max-w-3xl scroll-fade-in ${customSection.isVisible ? 'visible' : ''}`}
        >
          {!showCustomForm ? (
            <div className="text-center space-y-8 md:space-y-10">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#051C2C] leading-tight">
                  Turn Your Content into<br />Professional Slides
                </h2>
                <p className="text-lg md:text-xl text-[#5A6780] max-w-2xl mx-auto font-light leading-relaxed">
                  Have a story to tell? Articles, videos, podcasts—we'll transform your content into presentations that stand out.
                </p>
                <p className="text-xl md:text-2xl text-[#051C2C] font-medium">
                  This service is <span className="text-[#2251FF]">complimentary</span>. Limited slots available.
                </p>
              </div>

              <Button
                onClick={() => setShowCustomForm(true)}
                className="px-10 py-4 md:px-12 md:py-5 bg-[#2251FF] hover:bg-[#051C2C] text-white rounded-sm text-base md:text-lg font-medium transition-all"
              >
                Request Custom Creation →
              </Button>

              <p className="text-sm text-[#5A6780]">
                We review each request carefully and respond within 3 business days
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl md:text-4xl font-serif text-[#051C2C]">
                  Custom Request
                </h2>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="text-sm md:text-base text-[#5A6780] hover:text-[#051C2C] transition-colors"
                >
                  Hide form
                </button>
              </div>
              <CustomRequestForm />
            </div>
          )}
        </div>
      </section>

      {/* Footer - Same as Homepage */}
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
