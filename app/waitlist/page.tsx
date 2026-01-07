"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="w-full bg-white border-b border-[#E0E0E0]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
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

      {/* Page Content */}
      <div>
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-[#051C2C]">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal text-white leading-tight px-4">
                Be the first to experience
                <br />
                <span className="text-[#2251FF]">professional</span> AI
                presentations
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl font-light leading-relaxed px-4">
                Join our waitlist to get early access when we launch. We'll
                notify you as soon as Sdecky is ready.
              </p>
            </div>
          </div>
        </section>

        {/* Waitlist Form Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto max-w-2xl">
            {/* Benefits */}
            <div className="mb-12 space-y-6 text-center">
              <h2 className="text-2xl md:text-3xl font-serif text-[#051C2C]">
                Why join the waitlist?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
                <div className="space-y-2">
                  <div className="text-[#2251FF] text-3xl font-serif">01</div>
                  <h3 className="font-medium text-[#051C2C]">Early Access</h3>
                  <p className="text-sm text-[#5A6780]">
                    Be among the first to use Sdecky when we launch
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-[#2251FF] text-3xl font-serif">02</div>
                  <h3 className="font-medium text-[#051C2C]">
                    Exclusive Benefits
                  </h3>
                  <p className="text-sm text-[#5A6780]">
                    Special perks for early supporters
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-[#2251FF] text-3xl font-serif">03</div>
                  <h3 className="font-medium text-[#051C2C]">Stay Updated</h3>
                  <p className="text-sm text-[#5A6780]">
                    Get the latest news about our launch
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 sm:h-14 px-4 sm:px-6 text-base border-[#F0F0F0] focus:border-[#051C2C] rounded-sm"
                  disabled={status === "success"}
                />
                <Button
                  type="submit"
                  disabled={loading || status === "success"}
                  className="h-12 sm:h-14 px-6 sm:px-8 bg-[#051C2C] hover:bg-[#051C2C]/90 text-white rounded-sm text-base font-medium whitespace-nowrap"
                >
                  {loading
                    ? "Joining..."
                    : status === "success"
                    ? "Joined ✓"
                    : "Join Waitlist"}
                </Button>
              </form>

              {/* Success/Error Messages */}
              {message && (
                <div className="text-center">
                  {status === "success" && (
                    <p className="text-sm text-[#2251FF]">{message}</p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-600">{message}</p>
                  )}
                </div>
              )}

              {/* Privacy Note */}
              <p className="text-xs text-center text-[#5A6780] mt-4">
                We respect your privacy. Your email will only be used to notify
                you about Sdecky's launch.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#F0F0F0] py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-[#5A6780]">
          <p>&copy; 2025 Sdecky. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
