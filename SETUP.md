# Sdecky Landing Page + Admin Panel - Setup Guide

This is a complete landing page and admin panel for Sdecky, an AI-powered professional presentation generator.

## Features

### Landing Page
- Hero section with logo and tagline
- Gallery of PDF presentations
- Waitlist email signup form
- Professional design with Sdecky brand colors

### Admin Panel
- Upload PDFs with thumbnails (manual or auto-extracted from first page)
- Edit presentation metadata (title, description)
- Delete presentations (removes from database and storage)
- View waitlist emails with search and CSV export
- Email whitelist-based access control

## Prerequisites

- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- Git (optional)

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at https://supabase.com
2. Note your project URL and anon key from Settings > API

### 2. Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the entire contents of `sql/setup.sql`
3. Paste and run it in the SQL Editor
4. This will create:
   - `presentations` table for storing PDF metadata
   - `waitlist` table for email signups
   - Row Level Security (RLS) policies
   - Storage policies (note: storage buckets must be created manually)

### 3. Storage Buckets Setup

1. Go to Storage in your Supabase dashboard
2. Create two **public** buckets:

**Bucket 1: `presentations-pdfs`**
- Name: presentations-pdfs
- Public: ✅ Yes
- File size limit: 52428800 bytes (50MB)
- Allowed MIME types: application/pdf

**Bucket 2: `presentations-thumbnails`**
- Name: presentations-thumbnails
- Public: ✅ Yes
- File size limit: 5242880 bytes (5MB)
- Allowed MIME types: image/png, image/jpeg, image/webp

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

   # Admin emails (comma-separated)
   ADMIN_EMAILS=your-email@example.com,another-admin@example.com
   ```

3. **Important**: Replace the placeholder values with your actual:
   - Supabase project URL
   - Supabase publishable (anon) key
   - Admin email addresses (these users will have access to /admin routes)

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 7. Create Admin Account

Admin accounts must be created manually in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - Email: One of the emails from your `ADMIN_EMAILS` (e.g., `your-email@example.com`)
   - Password: Choose a secure password
   - Auto Confirm User: ✅ Yes (check this box)
5. Click **Create User**
6. Now you can log in at http://localhost:3000/auth/login with this email and password
7. After login, access http://localhost:3000/admin

## Project Structure

```
.
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with metadata
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with auth protection
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── upload/page.tsx         # Upload presentation page
│   │   └── waitlist/page.tsx       # View waitlist emails
│   └── auth/                       # Authentication pages
├── components/
│   ├── hero-section.tsx            # Hero component
│   ├── gallery.tsx                 # Gallery component
│   ├── waitlist-form.tsx           # Waitlist form
│   └── admin/                      # Admin components
├── lib/
│   ├── admin.ts                    # Admin utilities
│   ├── storage.ts                  # Supabase Storage helpers
│   ├── pdf-utils.ts                # PDF thumbnail extraction
│   └── supabase/                   # Supabase client setup
├── public/
│   ├── logo.png                    # Sdecky logo
│   └── showcase/                   # Static PDF samples
└── sql/
    └── setup.sql                   # Database schema and policies
```

## Usage

### Landing Page
- Navigate to http://localhost:3000
- View presentations in the gallery
- Sign up for the waitlist

### Admin Panel
- Navigate to http://localhost:3000/admin (requires admin account)
- **Upload**: Add new presentations with thumbnails
- **Dashboard**: View all presentations, edit or delete them
- **Waitlist**: View email signups, search, and export to CSV

### Upload Presentations
1. Go to /admin/upload
2. Select a PDF file
3. Choose thumbnail method:
   - **Manual**: Upload a separate image file
   - **Auto-extract**: Automatically generate from PDF first page
4. Fill in title and description
5. Click "Upload Presentation"

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ADMIN_EMAILS`
4. Deploy!

### Other Platforms

Make sure your platform supports:
- Next.js 16+
- Server-side rendering
- Environment variables

## Troubleshooting

### "Invalid Supabase URL" Error
- Make sure `.env.local` exists and has valid Supabase credentials
- Restart the dev server after changing environment variables

### Admin Access Denied
- Verify your email is in the `ADMIN_EMAILS` list
- Make sure you confirmed your email address
- Check that the email matches exactly (case-sensitive)

### PDF Upload Fails
- Verify storage buckets are created and public
- Check that RLS policies are applied (run setup.sql again if needed)
- Ensure PDF is under 50MB

### Thumbnail Auto-Extract Not Working
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser console for errors
- Try with a different PDF file

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed
- Clear `.next` folder and rebuild

## Brand Colors

Sdecky uses a professional blue-purple gradient:

- Primary Blue: `#2251FF` (HSL: 226 100% 57%)
- Secondary Purple: `#5F259F` (HSL: 268 62% 39%)
- Gradient: `linear-gradient(135deg, #2251FF, #5F259F)`

These colors are already configured in `app/globals.css`.

## Security Notes

- Admin access is controlled via email whitelist
- All database operations use Row Level Security (RLS)
- Storage buckets are public for read, authenticated for write
- File uploads are validated for type and size
- Never commit `.env.local` to version control

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase docs: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs

---

Made with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com)
