"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { validateThumbnailFile } from "@/lib/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ThumbnailUploadProps {
  onThumbnailChange: (file: File | null) => void;
  autoExtract: boolean;
  onAutoExtractChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ThumbnailUpload({
  onThumbnailChange,
  autoExtract,
  onAutoExtractChange,
  disabled,
}: ThumbnailUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateThumbnailFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setError(null);
    onThumbnailChange(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onThumbnailChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAutoExtractChange = (checked: boolean) => {
    onAutoExtractChange(checked);
    if (checked) {
      // Clear manual thumbnail if auto-extract is enabled
      handleRemove();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="auto-extract"
          checked={autoExtract}
          onCheckedChange={handleAutoExtractChange}
          disabled={disabled}
        />
        <Label htmlFor="auto-extract" className="text-sm font-normal cursor-pointer">
          Auto-extract thumbnail from PDF first page
        </Label>
      </div>

      {!autoExtract && (
        <div className="space-y-2">
          <Label>Manual Thumbnail Upload</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Thumbnail preview"
                  className="max-w-full h-auto max-h-48 mx-auto rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Click to upload or drag and drop</p>
                  <p className="text-xs">PNG, JPEG, or WebP (max 5MB)</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {autoExtract && (
        <Alert>
          <AlertDescription>
            Thumbnail will be automatically generated from the first page of your PDF
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
