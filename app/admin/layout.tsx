import { redirect } from "next/navigation";
import { isAdmin, getCurrentUserEmail } from "@/lib/admin";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { unstable_noStore } from "next/cache";

async function AdminAuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userEmail = data?.claims?.email as string | undefined;

  return (
    <div className="flex items-center gap-4">
      {userEmail && (
        <span className="text-sm text-white/70">{userEmail}</span>
      )}
      <form action="/auth/sign-out" method="post">
        <Button variant="outline" size="sm" type="submit" className="border-white/40 hover:bg-white hover:text-[#051C2C]">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </form>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent static generation
  unstable_noStore();

  // Check if user is admin
  const admin = await isAdmin();

  if (!admin) {
    // Redirect non-admin users to login
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Navigation - McKinsey Navy Theme */}
      <nav className="bg-[#051C2C] border-b border-[#051C2C]/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/admin" className="flex flex-col">
              <span className="text-lg md:text-xl font-serif font-bold text-white">
                Sdecky Admin
              </span>
              <span className="text-[10px] text-white/60 mt-0.5 hidden sm:block">
                Content Management
              </span>
            </Link>
            <div className="hidden md:flex gap-6 text-sm">
              <Link href="/admin" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/upload" className="text-white/80 hover:text-white transition-colors">
                Upload
              </Link>
              <Link href="/admin/waitlist" className="text-white/80 hover:text-white transition-colors">
                Waitlist
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="text-xs md:text-sm text-white/60 hover:text-white transition-colors">
              View Site
            </Link>
            <Suspense fallback={<div className="h-9 w-24 bg-white/10 animate-pulse rounded" />}>
              <AdminAuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
