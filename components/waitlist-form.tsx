"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase.from("waitlist").insert([{ email }]);

      setLoading(false);

      if (error) {
        console.error("Supabase Error:", error);
        setStatus("error");

        // Handle different error types
        if (error.code === "23505") {
          // Unique violation - email already exists
          setMessage("This email is already on the waitlist!");
        } else if (error.code === "PGRST116") {
          // Table doesn't exist
          setMessage("Database not configured. Please contact support.");
        } else if (error.message && error.message.trim()) {
          // Has error message
          setMessage(error.message);
        } else if (error.code) {
          // Has error code but no message
          setMessage(`Error (${error.code}). Please try again.`);
        } else {
          // Unknown error
          setMessage(
            "Failed to join waitlist. Please check your connection and try again."
          );
        }
      } else {
        setStatus("success");
        setMessage("You've been added to the waitlist!");
        setEmail("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setLoading(false);
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <section id="waitlist" className="w-full py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-8 lg:px-12 mx-auto max-w-4xl text-center">
        {/* Section Header */}
        <div className="space-y-4 md:space-y-6 mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#051C2C] leading-tight px-2">
            Be the first to experience
            <br />
            professional AI presentations
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#5A6780] font-light leading-relaxed px-4">
            Join our waitlist to get early access when we launch.
          </p>
        </div>

        {/* Form - Mobile Optimized */}
        <div className="max-w-xl mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base border-[#F0F0F0] focus:border-[#051C2C] rounded-sm"
              disabled={status === "success"}
            />
            <Button
              type="submit"
              disabled={loading || status === "success"}
              className="h-12 sm:h-14 px-6 sm:px-8 bg-[#051C2C] hover:bg-[#051C2C]/90 active:bg-[#051C2C]/80 text-white rounded-sm text-sm sm:text-base font-medium whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {status === "success" ? "Joined" : "Join Waitlist"}
            </Button>
          </form>

          {/* Feedback Messages - Minimal Style */}
          {message && status === "success" && (
            <p className="text-sm text-[#2251FF] px-4">{message}</p>
          )}
          {message && status === "error" && (
            <p className="text-sm text-red-600 px-4">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
