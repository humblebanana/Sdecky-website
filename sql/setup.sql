-- Sdecky Database Setup Script
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create presentations table
-- ============================================

CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  thumbnail_url TEXT,
  pdf_storage_path TEXT NOT NULL,
  thumbnail_storage_path TEXT,
  file_size_bytes BIGINT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add language column if it doesn't exist (for existing databases)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presentations' AND column_name = 'language'
  ) THEN
    ALTER TABLE presentations ADD COLUMN language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Add is_free column if it doesn't exist (for existing databases)
-- true = show all pages, false = show only half pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presentations' AND column_name = 'is_free'
  ) THEN
    ALTER TABLE presentations ADD COLUMN is_free BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS presentations_created_at_idx ON presentations(created_at DESC);

-- ============================================
-- 2. Create waitlist table
-- ============================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);

-- ============================================
-- 3. Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on presentations table
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on waitlist table
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS Policies for presentations table
-- ============================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public presentations are viewable by everyone" ON presentations;
DROP POLICY IF EXISTS "Authenticated users can insert presentations" ON presentations;
DROP POLICY IF EXISTS "Authenticated users can update presentations" ON presentations;
DROP POLICY IF EXISTS "Authenticated users can delete presentations" ON presentations;

-- Public can read all presentations
CREATE POLICY "Public presentations are viewable by everyone"
  ON presentations FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert presentations"
  ON presentations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update presentations"
  ON presentations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete presentations"
  ON presentations FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 5. RLS Policies for waitlist table
-- ============================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON waitlist;

-- Anyone can insert to waitlist (anon users can sign up)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read waitlist
CREATE POLICY "Authenticated users can view waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 6. Storage Bucket Configuration
-- ============================================

-- Note: Storage buckets must be created in Supabase Dashboard
-- This SQL is for documentation purposes only

-- Bucket: presentations-pdfs
--   - Public: true
--   - File size limit: 52428800 (50MB)
--   - Allowed MIME types: application/pdf

-- Bucket: presentations-thumbnails
--   - Public: true
--   - File size limit: 5242880 (5MB)
--   - Allowed MIME types: image/png, image/jpeg, image/webp

-- ============================================
-- 7. Storage Policies (RLS for storage.objects)
-- ============================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public PDF Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Public Thumbnail Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload Thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update Thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete Thumbnails" ON storage.objects;

-- PDF Bucket Policies
CREATE POLICY "Public PDF Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presentations-pdfs');

CREATE POLICY "Authenticated users can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'presentations-pdfs');

CREATE POLICY "Authenticated users can update PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'presentations-pdfs')
  WITH CHECK (bucket_id = 'presentations-pdfs');

CREATE POLICY "Authenticated users can delete PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'presentations-pdfs');

-- Thumbnail Bucket Policies
CREATE POLICY "Public Thumbnail Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presentations-thumbnails');

CREATE POLICY "Authenticated users can upload Thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'presentations-thumbnails');

CREATE POLICY "Authenticated users can update Thumbnails"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'presentations-thumbnails')
  WITH CHECK (bucket_id = 'presentations-thumbnails');

CREATE POLICY "Authenticated users can delete Thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'presentations-thumbnails');

-- ============================================
-- Setup Complete!
-- ============================================

-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard:
--    - presentations-pdfs (public, 50MB limit)
--    - presentations-thumbnails (public, 5MB limit)
--
-- 2. Add ADMIN_EMAILS to your .env.local file
--
-- 3. Deploy your Next.js application
