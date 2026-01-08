"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2, ExternalLink, Star } from "lucide-react";
import { EditPresentationDialog } from "./edit-presentation-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

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

interface PresentationCardAdminProps {
  presentation: Presentation;
  onUpdate: () => void;
}

export function PresentationCardAdmin({ presentation, onUpdate }: PresentationCardAdminProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="group overflow-hidden">
        <CardContent className="p-0 aspect-[4/3] relative bg-muted flex items-center justify-center">
          {presentation.thumbnail_url ? (
            <img
              src={presentation.thumbnail_url}
              alt={presentation.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText className="w-16 h-16 text-muted-foreground" />
          )}
          {/* Featured Badge */}
          {presentation.is_featured && (
            <div className="absolute top-3 left-3 bg-[#2251FF] text-white px-2 py-1 rounded-sm text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="icon" asChild>
              <a href={presentation.pdf_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-4 space-y-3">
          <div className="w-full space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1">{presentation.title}</h3>
            {presentation.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {presentation.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatFileSize(presentation.file_size_bytes)}</span>
              <span>•</span>
              <span>{formatDate(presentation.created_at)}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      <EditPresentationDialog
        presentation={presentation}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onUpdate}
      />

      <DeleteConfirmationDialog
        presentation={presentation}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={onUpdate}
      />
    </>
  );
}
