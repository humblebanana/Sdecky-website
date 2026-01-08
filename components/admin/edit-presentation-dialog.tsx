"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Presentation {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  thumbnail_url: string | null;
  pdf_storage_path: string;
  thumbnail_storage_path: string | null;
  file_size_bytes: number | null;
  created_at: string;
  is_featured?: boolean;
}

interface EditPresentationDialogProps {
  presentation: Presentation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPresentationDialog({
  presentation,
  open,
  onOpenChange,
  onSuccess,
}: EditPresentationDialogProps) {
  const [title, setTitle] = useState(presentation.title);
  const [description, setDescription] = useState(presentation.description || "");
  const [isFeatured, setIsFeatured] = useState(presentation.is_featured || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('presentations')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          is_featured: isFeatured,
        })
        .eq('id', presentation.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update presentation');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      // Reset form when closing
      if (!newOpen) {
        setTitle(presentation.title);
        setDescription(presentation.description || "");
        setIsFeatured(presentation.is_featured || false);
        setError(null);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Presentation</DialogTitle>
            <DialogDescription>
              Update the title and description of your presentation
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-is-featured">Featured on Homepage</Label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-is-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300 text-[#2251FF] focus:ring-[#2251FF]"
                />
                <label htmlFor="edit-is-featured" className="text-sm text-muted-foreground cursor-pointer">
                  Show this presentation on the homepage gallery
                </label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
