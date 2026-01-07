"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PresentationCardAdmin } from "./presentation-card-admin";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export function PresentationListAdmin() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setPresentations(data || []);
    } catch (err) {
      console.error('Error fetching presentations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load presentations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No presentations yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your first presentation to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {presentations.map((presentation) => (
        <PresentationCardAdmin
          key={presentation.id}
          presentation={presentation}
          onUpdate={fetchPresentations}
        />
      ))}
    </div>
  );
}
