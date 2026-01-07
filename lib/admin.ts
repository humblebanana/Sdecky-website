import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current authenticated user is an admin.
 * Admins are defined by the ADMIN_EMAILS environment variable.
 *
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims?.email) {
      return false;
    }

    const userEmail = data.claims.email as string;
    const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsRaw
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);

    return adminEmails.includes(userEmail.toLowerCase());
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin access. Throws an error if the user is not an admin.
 * Use this in API routes or server actions that need admin protection.
 *
 * @throws Error if user is not an admin
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

/**
 * Get the current user's email if authenticated.
 *
 * @returns Promise<string | null> - user email or null
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims?.email) {
      return null;
    }

    return data.claims.email as string;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}
