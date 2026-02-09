import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E5E7EB] bg-[#F8F8F8]">
      <div className="container mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-8 md:pb-12 md:pt-20 lg:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-12">
          <div className="space-y-4">
            <p className="max-w-xl font-serif text-xl italic leading-relaxed text-[#0F172A]/80 md:text-2xl">
              "Every great idea deserves<br />a professional presentation"
            </p>
            <h2 className="font-serif text-4xl font-normal tracking-tight text-[#051C2C] md:text-5xl">
              Sdecky
            </h2>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#0F172A]">Company</h3>
            <ul className="space-y-4 text-[#334155]">
              <li>
                <Link href="/" className="transition-colors hover:text-[#2251FF]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="transition-colors hover:text-[#2251FF]">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="transition-colors hover:text-[#2251FF]">
                  Join Waitlist
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-[#0F172A]">Resources</h3>
            <ul className="space-y-4 text-[#334155]">
              <li>
                <a
                  href="mailto:alia@sdecky.ai"
                  className="transition-colors hover:text-[#2251FF]"
                >
                  Contact us
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/sdecky-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#2251FF]"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-[#E5E7EB] pt-8 md:mt-16">
          <div className="flex flex-col gap-6 text-sm text-[#475569] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <a
                href="mailto:alia@sdecky.ai"
                aria-label="Email Sdecky"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D1D5DB] text-[#111827] transition-all hover:border-[#2251FF] hover:text-[#2251FF]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/sdecky-ai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Sdecky on LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D1D5DB] text-[#111827] transition-all hover:border-[#2251FF] hover:text-[#2251FF]"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <p>&copy; {currentYear} Sdecky AI. Mountain View, California. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
