import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { CustomRequestsTable } from "@/components/admin/custom-requests-table";

export default async function CustomRequestsPage() {
  unstable_noStore();

  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect("/");
  }

  // Fetch custom requests
  const supabase = await createClient();
  const { data: requests, error } = await supabase
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching custom requests:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#051C2C]">Custom Requests</h1>
        <p className="text-[#5A6780] mt-2">
          Manage custom presentation requests from users
        </p>
      </div>

      <CustomRequestsTable requests={requests || []} />
    </div>
  );
}
