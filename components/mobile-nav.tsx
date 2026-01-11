"use client";

import Link from "next/link";

export function MobileNav() {
  return (
    <div className="md:hidden flex items-center gap-3">
      {/* Always visible Join Waitlist button on mobile */}
      <Link
        href="/waitlist"
        className="px-4 py-2 bg-[#2251FF] text-white hover:bg-[#051C2C] transition-colors rounded-sm text-sm font-medium whitespace-nowrap"
      >
        Join Waitlist
      </Link>
    </div>
  );
}
