"use client";

interface CategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-transparent bg-gradient-to-r from-teal-800 to-teal-700 text-white shadow-md shadow-teal-800/25 scale-[1.02]"
          : "border-stone-200 bg-white text-stone-600 hover:border-amber-600/40 hover:text-amber-700 hover:bg-amber-50/50"
      }`}
    >
      {label}
    </button>
  );
}