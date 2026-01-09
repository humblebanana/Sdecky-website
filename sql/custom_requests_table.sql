-- Create custom_requests table for users who want custom presentations created
CREATE TABLE IF NOT EXISTS custom_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  details TEXT,
  language TEXT DEFAULT 'en',
  agreed_to_terms BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending', -- pending, reviewing, accepted, rejected, completed
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_email ON custom_requests(email);

-- RLS Policies
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit request)
CREATE POLICY "Allow public insert on custom_requests"
  ON custom_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can read (admin panel)
CREATE POLICY "Allow authenticated read on custom_requests"
  ON custom_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update (admin panel)
CREATE POLICY "Allow authenticated update on custom_requests"
  ON custom_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_custom_requests_updated_at
  BEFORE UPDATE ON custom_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_requests_updated_at();
