"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ThumbnailUpload } from "@/components/admin/thumbnail-upload";
import { uploadPDF, uploadThumbnail, validatePDFFile } from "@/lib/storage";
import { generateThumbnailFromPDF } from "@/lib/pdf-utils";
import { createClient } from "@/lib/supabase/client";
import { FileText, Loader2 } from "lucide-react";

export function PresentationUploadForm() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [autoExtract, setAutoExtract] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePDFSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validatePDFFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid PDF file");
      setPdfFile(null);
      return;
    }

    setError(null);
    setPdfFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate inputs
    if (!pdfFile) {
      setError("Please select a PDF file");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!autoExtract && !thumbnailFile) {
      setError("Please upload a thumbnail or enable auto-extract");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Upload PDF
      setProgress(30);
      const pdfResult = await uploadPDF(pdfFile);

      // Handle thumbnail
      setProgress(50);
      let thumbnailResult;

      if (autoExtract) {
        // Generate thumbnail from PDF
        const thumbnailBlob = await generateThumbnailFromPDF(pdfFile);
        thumbnailResult = await uploadThumbnail(thumbnailBlob, pdfFile.name);
      } else if (thumbnailFile) {
        // Upload manual thumbnail
        thumbnailResult = await uploadThumbnail(thumbnailFile);
      } else {
        throw new Error("No thumbnail available");
      }

      setProgress(70);

      // Insert into database
      const supabase = createClient();
      const { error: dbError } = await supabase.from('presentations').insert({
        title: title.trim(),
        description: description.trim() || null,
        pdf_url: pdfResult.publicUrl,
        thumbnail_url: thumbnailResult.publicUrl,
        pdf_storage_path: pdfResult.storagePath,
        thumbnail_storage_path: thumbnailResult.storagePath,
        file_size_bytes: pdfFile.size,
        language: language,
      });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setProgress(100);
      setSuccess(true);

      // Reset form
      setPdfFile(null);
      setThumbnailFile(null);
      setTitle("");
      setDescription("");
      setLanguage("en");
      setAutoExtract(true);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload presentation');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Presentation</CardTitle>
        <CardDescription>
          Upload a PDF presentation with a thumbnail and metadata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF File Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf">PDF File *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="pdf"
                type="file"
                accept="application/pdf"
                onChange={handlePDFSelect}
                disabled={uploading}
              />
              {pdfFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{pdfFile.name}</span>
                  <span className="text-xs">
                    ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <ThumbnailUpload
            onThumbnailChange={setThumbnailFile}
            autoExtract={autoExtract}
            onAutoExtractChange={setAutoExtract}
            disabled={uploading}
          />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Manus CTO Presentation"
              disabled={uploading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the presentation..."
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={uploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="en">English</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="ja">日本語 (Japanese)</option>
              <option value="ko">한국어 (Korean)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
              <option value="pt">Português (Portuguese)</option>
            </select>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 30 && "Uploading PDF..."}
                {progress >= 30 && progress < 50 && "Processing PDF..."}
                {progress >= 50 && progress < 70 && "Uploading thumbnail..."}
                {progress >= 70 && progress < 100 && "Saving to database..."}
                {progress === 100 && "Complete!"}
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>
                Presentation uploaded successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-brand-gradient text-white hover:opacity-90"
              disabled={uploading || !pdfFile || !title.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Presentation"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin')}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
