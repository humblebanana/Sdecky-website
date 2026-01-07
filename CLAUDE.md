# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sdecky is a Next.js 16 application for an AI-powered professional presentation generator. It consists of:
- **Public landing page** with gallery, hero, and waitlist signup
- **Admin panel** for managing PDF presentations with upload, edit, and delete capabilities
- **Supabase backend** for authentication, database, and file storage

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Authentication & Authorization

**Email Whitelist System**: Admin access is controlled via the `ADMIN_EMAILS` environment variable, NOT database roles.

- `lib/admin.ts` exports `isAdmin()` which checks if authenticated user's email is in the whitelist
- Admin routes at `/app/admin/*` use `isAdmin()` in layouts to protect access
- All admin pages MUST call `unstable_noStore()` to prevent static generation (required for cookie-based auth)

**Supabase SSR Pattern**:
- `lib/supabase/server.ts`: Server-side client (uses cookies, created per-request)
- `lib/supabase/client.ts`: Client-side browser client
- **Critical**: Always create new Supabase clients per-request, never store in globals (Fluid Compute requirement)

### Database Schema

Two main tables (see `sql/setup.sql`):

**presentations**:
- Stores both `pdf_url` (public URL) AND `pdf_storage_path` (internal path for deletion)
- Same for thumbnails: `thumbnail_url` and `thumbnail_storage_path`
- This dual-path system is necessary because Supabase Storage requires internal paths to delete files

**waitlist**:
- Simple email collection with unique constraint
- Public INSERT, authenticated SELECT (RLS policies)

### Storage Architecture

**Two Supabase Storage buckets** (must be created manually in dashboard):
- `presentations-pdfs`: 50MB limit, PDF files only
- `presentations-thumbnails`: 5MB limit, images only

**Upload flow** (`lib/storage.ts`):
1. Upload file to Supabase Storage
2. Get public URL from Storage
3. Extract internal path from upload response
4. Store BOTH public URL and internal path in database
5. Use internal path for deletion via `deleteFile(bucket, path)`

### PDF Thumbnail Extraction

`lib/pdf-utils.ts` uses `pdfjs-dist` to extract first page as PNG:
- Runs client-side only (uses browser canvas API)
- Worker source loaded from CDN
- Returns Blob that can be uploaded to Storage

**Hybrid thumbnail approach**:
- User can manually upload image, OR
- Check "auto-extract" to generate from PDF first page
- Handled in `components/admin/presentation-upload-form.tsx`

### Critical Configuration

**next.config.ts**:
```typescript
cacheComponents: false  // MUST be false for admin auth to work
```

This is required because admin routes use cookies() which is incompatible with component caching.

**Dynamic Routes**:
All admin pages must use `unstable_noStore()` at the top of server components to prevent prerendering errors with cookie-based authentication.

### Component Organization

**Landing page components** (public):
- `components/hero-section.tsx`
- `components/gallery.tsx` - Fetches from DB, merges with static PDFs in `/public/showcase`
- `components/waitlist-form.tsx`

**Admin components** (protected):
- `components/admin/presentation-upload-form.tsx` - Main upload logic
- `components/admin/thumbnail-upload.tsx` - Thumbnail upload/extract toggle
- `components/admin/presentation-list.tsx` - Fetches and displays all presentations
- `components/admin/presentation-card-admin.tsx` - Individual card with edit/delete
- `components/admin/edit-presentation-dialog.tsx` - Edit title/description
- `components/admin/delete-confirmation-dialog.tsx` - Delete with storage cleanup
- `components/admin/waitlist-table.tsx` - Display emails with search/CSV export

### Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxx
ADMIN_EMAILS=email1@domain.com,email2@domain.com
```

**ADMIN_EMAILS is comma-separated**. Emails are case-insensitive matched in `lib/admin.ts`.

## Supabase Setup Requirements

Before the app works, you must:

1. **Run `sql/setup.sql`** in Supabase SQL Editor to create:
   - Tables: `presentations`, `waitlist`
   - RLS policies (public read, authenticated write)
   - Storage policies
   - Triggers for `updated_at`

2. **Create Storage Buckets** manually in Supabase dashboard:
   - `presentations-pdfs` (public, 50MB, PDF only)
   - `presentations-thumbnails` (public, 5MB, images only)

3. **Configure email auth** in Supabase Auth settings for user signup/login

## File Upload & Storage Pattern

When uploading presentations:
1. Validate file types/sizes client-side (`lib/storage.ts` has validators)
2. Upload PDF to `presentations-pdfs` bucket
3. Either upload manual thumbnail OR extract from PDF using `generateThumbnailFromPDF()`
4. Upload thumbnail to `presentations-thumbnails` bucket
5. Insert record with BOTH URLs and storage paths to database
6. On delete: Remove from DB first, then delete files using storage paths

**Important**: Storage paths are needed for deletion. Don't store only URLs.

## Brand Guidelines

Sdecky brand colors (defined in `app/globals.css`):
- Primary Blue: `#2251FF` (HSL: 226 100% 57%)
- Secondary Purple: `#5F259F` (HSL: 268 62% 39%)
- Gradient class: `bg-brand-gradient` → `linear-gradient(135deg, #2251FF, #5F259F)`

Use the gradient for CTAs and brand elements. Maintain professional, elegant aesthetic.

## Common Gotchas

1. **"Invalid Supabase URL" error**: `.env.local` has placeholder values or doesn't exist
2. **Admin routes fail to render**: Missing `unstable_noStore()` in server component
3. **Build fails with "cacheComponents" error**: Don't use `export const dynamic = 'force-dynamic'` in routes
4. **File upload succeeds but delete fails**: Not storing `storage_path` fields in database
5. **PDF thumbnail extraction fails**: Browser doesn't support canvas API or CORS issues with worker

## Deployment Notes

For Vercel (recommended):
- All environment variables must be set in Vercel dashboard
- Supabase Storage buckets must be created before first upload
- Database schema must be initialized via `sql/setup.sql`

The app uses SSR heavily, so ensure deployment platform supports:
- Next.js 16+ with App Router
- Server-side rendering
- Dynamic route generation
