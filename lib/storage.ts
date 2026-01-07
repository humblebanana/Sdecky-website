import { createClient } from "@/lib/supabase/client";

/**
 * Upload a PDF file to Supabase Storage.
 *
 * @param file - The PDF file to upload
 * @returns Object with publicUrl and storagePath
 * @throws Error if upload fails
 */
export async function uploadPDF(file: File): Promise<{
  publicUrl: string;
  storagePath: string;
}> {
  const supabase = createClient();

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${sanitizedFileName}`;
  const filePath = `pdfs/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('presentations-pdfs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload PDF: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('presentations-pdfs')
    .getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    storagePath: filePath,
  };
}

/**
 * Upload a thumbnail image to Supabase Storage.
 *
 * @param file - The image file to upload
 * @returns Object with publicUrl and storagePath
 * @throws Error if upload fails
 */
export async function uploadThumbnail(file: File | Blob, originalFileName?: string): Promise<{
  publicUrl: string;
  storagePath: string;
}> {
  const supabase = createClient();

  // Generate unique filename
  const timestamp = Date.now();
  const extension = file instanceof File
    ? file.name.split('.').pop() || 'png'
    : 'png';
  const baseName = originalFileName
    ? originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '')
    : 'thumbnail';
  const fileName = `${timestamp}-${baseName}.${extension}`;
  const filePath = `thumbnails/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('presentations-thumbnails')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('presentations-thumbnails')
    .getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    storagePath: filePath,
  };
}

/**
 * Delete a file from Supabase Storage.
 *
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @throws Error if deletion fails
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file from ${bucket}: ${error.message}`);
  }
}

/**
 * Delete a PDF and its associated thumbnail from storage.
 *
 * @param pdfStoragePath - Path to the PDF file
 * @param thumbnailStoragePath - Path to the thumbnail file (optional)
 */
export async function deletePresentationFiles(
  pdfStoragePath: string,
  thumbnailStoragePath?: string | null
): Promise<void> {
  const errors: string[] = [];

  // Delete PDF
  try {
    await deleteFile('presentations-pdfs', pdfStoragePath);
  } catch (error) {
    errors.push(`PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Delete thumbnail if it exists
  if (thumbnailStoragePath) {
    try {
      await deleteFile('presentations-thumbnails', thumbnailStoragePath);
    } catch (error) {
      errors.push(`Thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to delete some files: ${errors.join(', ')}`);
  }
}

/**
 * Extract storage path from a public URL.
 * Supabase public URLs have format: https://.../storage/v1/object/public/{bucket}/{path}
 *
 * @param url - The public URL
 * @param bucket - The bucket name
 * @returns The storage path
 */
export function getStoragePathFromUrl(url: string, bucket: string): string | null {
  try {
    const bucketPath = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(bucketPath);

    if (index === -1) {
      return null;
    }

    return url.substring(index + bucketPath.length);
  } catch (error) {
    console.error('Error extracting storage path from URL:', error);
    return null;
  }
}

/**
 * Validate file type for PDF uploads.
 *
 * @param file - The file to validate
 * @returns true if valid, false otherwise
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 52428800; // 50MB

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'PDF file must be less than 50MB' };
  }

  return { valid: true };
}

/**
 * Validate file type for thumbnail uploads.
 *
 * @param file - The file to validate
 * @returns true if valid, false otherwise
 */
export function validateThumbnailFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5242880; // 5MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Thumbnail must be PNG, JPEG, or WebP' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Thumbnail must be less than 5MB' };
  }

  return { valid: true };
}
