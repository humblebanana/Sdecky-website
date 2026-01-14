"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/mobile-nav";
import { CustomRequestForm } from "@/components/custom-request-form";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("waitlist");

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
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar - Same as Homepage */}
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

      <main className="flex-1 flex flex-col">
        {/* Hero Section - Like Gallery Page */}
        <section className="w-full py-16 md:py-24 bg-[#051C2C]">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal text-white leading-tight px-4">
                Get Started with Sdecky
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl font-light leading-relaxed px-4">
                Join our waitlist for early access, or request a custom presentation
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - White Background */}
        <section className="w-full bg-white py-16 md:py-20 flex-1">
          <div className="container px-4 md:px-8 lg:px-12 mx-auto max-w-5xl">
            {/* Tabs Component */}
            <Tabs defaultValue="waitlist" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-10 md:mb-12">
                <TabsList>
                  <TabsTrigger value="waitlist">
                    Join Waitlist
                  </TabsTrigger>
                  <TabsTrigger value="custom">
                    Request Custom
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Waitlist Tab */}
              <TabsContent value="waitlist" className="max-w-3xl mx-auto">
                <div className="space-y-8 md:space-y-10">
                  <div className="space-y-4 text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-[#051C2C]">
                      Get <span className="text-[#2251FF]">Early Access</span>
                    </h2>
                    <p className="text-base md:text-lg text-[#5A6780] font-light leading-relaxed">
                      Experience professional AI presentations. Join our waitlist to get early access when we launch.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 h-16 md:h-16 px-5 md:px-6 text-base md:text-lg border-[#E0E0E0] focus:border-[#2251FF] rounded-lg shadow-sm"
                        disabled={status === "success"}
                      />
                      <Button
                        type="submit"
                        disabled={loading || status === "success"}
                        className="h-12 md:h-14 px-8 md:px-10 bg-[#2251FF] hover:bg-[#051C2C] text-white rounded-lg text-base md:text-lg font-medium whitespace-nowrap shadow-lg hover:shadow-xl transition-all"
                      >
                        {loading
                          ? "Joining..."
                          : status === "success"
                          ? "At your service ✓"
                          : "Join Now"}
                      </Button>
                    </div>

                    {/* Feedback Messages */}
                    {message && (
                      <div className="text-center">
                        {status === "success" && (
                          <p className="text-sm md:text-base text-[#2251FF] font-medium">{message}</p>
                        )}
                        {status === "error" && (
                          <p className="text-sm md:text-base text-red-600">{message}</p>
                        )}
                      </div>
                    )}

                    {/* Privacy Note */}
                    <p className="text-sm text-center text-[#5A6780]/80">
                      We respect your privacy. Your email will only be used to notify you about Sdecky's launch.
                    </p>
                  </form>
                </div>
              </TabsContent>

              {/* Custom Request Tab */}
              <TabsContent value="custom" className="max-w-3xl mx-auto">
                <div className="space-y-8">
                  <div className="space-y-4 text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-[#051C2C] leading-tight">
                      Turn Your Content into Professional Slides
                    </h2>
                    <p className="text-base md:text-lg text-[#5A6780] font-light leading-relaxed">
                      Have a story to tell? Articles, videos, podcasts—we'll transform your content into presentations that stand out.
                    </p>
                    <p className="text-lg md:text-xl text-[#051C2C] font-medium">
                      This service is <span className="text-[#2251FF]">complimentary</span>. Limited slots available.
                    </p>
                  </div>
                  <CustomRequestForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

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
    </div>
  );
}
