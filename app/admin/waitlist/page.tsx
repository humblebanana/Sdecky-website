import { createClient } from "@/lib/supabase/server";
import { WaitlistTable } from "@/components/admin/waitlist-table";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { unstable_noStore } from "next/cache";

async function getWaitlistEmails() {
  unstable_noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching waitlist:', error);
    return [];
  }

  return data || [];
}

export default async function WaitlistPage() {
  const emails = await getWaitlistEmails();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Waitlist Emails
          </h1>
          <p className="text-muted-foreground mt-1">
            {emails.length} {emails.length === 1 ? 'person has' : 'people have'} joined the waitlist
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Signups</CardTitle>
          <CardDescription>
            Manage and export your waitlist email signups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaitlistTable emails={emails} />
        </CardContent>
      </Card>
    </div>
  );
}
