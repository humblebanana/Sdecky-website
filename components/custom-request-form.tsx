"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function CustomRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [language, setLanguage] = useState("en");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    if (!agreedToTerms) {
      setStatus("error");
      setMessage("Please confirm that you understand the terms.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("custom_requests").insert([
        {
          name: name.trim() || null,
          email: email.trim(),
          topic: topic.trim(),
          details: details.trim() || null,
          language,
          agreed_to_terms: agreedToTerms,
        },
      ]);

      if (error) {
        throw error;
      }

      setStatus("success");
      setMessage(
        "Request submitted successfully! We'll review and reach out within 3 business days."
      );

      // Reset form
      setName("");
      setEmail("");
      setTopic("");
      setDetails("");
      setLanguage("en");
      setAgreedToTerms(false);
    } catch (error) {
      console.error("Error submitting custom request:", error);
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-sm p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || status === "success"}
            className="h-12 px-4 text-base border-[#E0E0E0] focus:border-[#051C2C] rounded-sm"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || status === "success"}
            className="h-12 px-4 text-base border-[#E0E0E0] focus:border-[#051C2C] rounded-sm"
          />
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic">
            What's your presentation about? <span className="text-red-500">*</span>
          </Label>
          <Input
            id="topic"
            type="text"
            placeholder="e.g., AI Product Launch for Enterprise Clients"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={loading || status === "success"}
            className="h-12 px-4 text-base border-[#E0E0E0] focus:border-[#051C2C] rounded-sm"
          />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <Label htmlFor="details" className="text-base">
            Your Content <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-[#5A6780] mb-2">
            Share your story: paste article text, links to videos/podcasts/PDFs, or describe your key points
          </p>
          <Textarea
            id="details"
            placeholder="Examples:
• Article URL or full text
• YouTube/podcast link
• PDF link or key points
• Main message and target audience

The more context you provide, the better we can craft your presentation."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={10}
            disabled={loading || status === "success"}
            className="px-4 py-3 text-base border-[#E0E0E0] focus:border-[#051C2C] rounded-sm resize-y min-h-[200px]"
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading || status === "success"}
            className="flex h-12 w-full rounded-sm border border-[#E0E0E0] bg-white px-4 py-2 text-base focus:border-[#051C2C] focus:outline-none focus:ring-2 focus:ring-[#051C2C] focus:ring-offset-2"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agreedToTerms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            disabled={loading || status === "success"}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#2251FF] focus:ring-[#2251FF]"
          />
          <Label htmlFor="agreedToTerms" className="text-sm cursor-pointer leading-relaxed">
            I understand this is a <strong>complimentary service</strong> provided free of charge, and availability is limited due to capacity constraints. We'll review requests on a case-by-case basis.
          </Label>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Alert variant={status === "error" ? "destructive" : "default"}>
            <AlertDescription className={status === "success" ? "text-[#2251FF]" : ""}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || status === "success"}
          className="w-full h-12 bg-[#051C2C] hover:bg-[#051C2C]/90 text-white rounded-sm text-base font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : status === "success" ? (
            "Request Submitted ✓"
          ) : (
            "Submit Request →"
          )}
        </Button>

        {/* Notice */}
        {status !== "success" && (
          <p className="text-xs text-center text-[#5A6780]">
            Limited slots available. We'll review your request and reach out within 3 business days.
          </p>
        )}
      </form>
    </div>
  );
}
