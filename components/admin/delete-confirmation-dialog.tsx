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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { deletePresentationFiles } from "@/lib/storage";
import { Loader2, AlertTriangle } from "lucide-react";

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
}

interface DeleteConfirmationDialogProps {
  presentation: Presentation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteConfirmationDialog({
  presentation,
  open,
  onOpenChange,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      // Delete from database first
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('presentations')
        .delete()
        .eq('id', presentation.id);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Delete files from storage
      try {
        await deletePresentationFiles(
          presentation.pdf_storage_path,
          presentation.thumbnail_storage_path
        );
      } catch (storageError) {
        console.error('Storage deletion error:', storageError);
        // Don't throw error here - database record is already deleted
        // Storage files can be cleaned up manually if needed
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete presentation');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      if (!newOpen) {
        setError(null);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Presentation
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The presentation and its files will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{presentation.title}</span>?
          </p>

          {error && (
            <Alert variant="destructive" className="mt-4">
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Presentation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
