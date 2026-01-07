import { createClient } from "@/lib/supabase/server";
import { PresentationListAdmin } from "@/components/admin/presentation-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileUp, Users, FileText } from "lucide-react";
import { unstable_noStore } from "next/cache";

async function getStats() {
  unstable_noStore();
  const supabase = await createClient();

  const [presentationsResult, waitlistResult] = await Promise.all([
    supabase.from('presentations').select('*', { count: 'exact', head: true }),
    supabase.from('waitlist').select('*', { count: 'exact', head: true }),
  ]);

  return {
    presentations: presentationsResult.count || 0,
    waitlist: waitlistResult.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage presentations and view waitlist signups
          </p>
        </div>
        <Link href="/admin/upload">
          <Button className="bg-brand-gradient text-white hover:opacity-90">
            <FileUp className="mr-2 h-4 w-4" />
            Upload New
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Presentations
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Presentations in gallery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Waitlist Signups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.waitlist}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total email signups
                </p>
              </div>
              <Link href="/admin/waitlist">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Presentations List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Presentations</h2>
        <PresentationListAdmin />
      </div>
    </div>
  );
}
