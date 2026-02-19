import Link from "next/link";

export const Nav = () => {
  return (
    <nav className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* BRANDING */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:text-white transition-colors"
        >
          <span className="font-bold text-lg tracking-wide font-[family-name:var(--font-germania-one)]">
            PubQuest Admin
          </span>
        </Link>

        {/* RIGHT SIDE (Optional placeholders for now) */}
        <div className="text-xs font-mono text-slate-500">v1.0.0</div>
      </div>
    </nav>
  );
};
