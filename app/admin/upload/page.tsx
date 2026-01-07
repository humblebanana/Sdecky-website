import { PresentationUploadForm } from "@/components/admin/presentation-upload-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Presentation</h1>
        <p className="text-muted-foreground">
          Upload a new PDF presentation with thumbnail and metadata
        </p>
      </div>

      <PresentationUploadForm />
    </div>
  );
}
