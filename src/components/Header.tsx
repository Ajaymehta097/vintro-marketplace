"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Search,
  Heart,
  LogIn,
  UserCircle,
  MessageCircle,
  Bell,
  Plus,
} from "lucide-react";

const LOCATIONS = ["India", "United States", "United Kingdom", "UAE"];

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200 bg-stone-50/90 px-4 py-3 backdrop-blur md:gap-4 md:px-8">
      {/* Location dropdown */}
      <div className="relative shrink-0">
        <button
          onClick={() => setLocationOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-stone-600 hover:bg-stone-200/60 transition-colors"
        >
          <span className="hidden font-medium text-stone-900 sm:inline">{location}</span>
          <ChevronDown size={15} className={`transition-transform ${locationOpen ? "rotate-180" : ""}`} />
        </button>
        {locationOpen && (
          <ul className="absolute left-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-md">
            {LOCATIONS.map((loc) => (
              <li key={loc}>
                <button
                  onClick={() => {
                    setLocation(loc);
                    setLocationOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-sm text-stone-600 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                >
                  {loc}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search bar */}
      <div className="relative min-w-0 flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Search for 'vintage TV', 'denim jacket'..."
          className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20 transition-all shadow-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
        <IconButton href="/wishlist" label="Wishlist">
          <Heart size={19} />
        </IconButton>

        {isLoggedIn ? (
          <>
            <IconButton href="/chat" label="Chat">
              <MessageCircle size={19} />
            </IconButton>
            <IconButton href="/notifications" label="Notifications" dot>
              <Bell size={19} />
            </IconButton>
            <Link
              href="/profile"
              aria-label="Profile"
              className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-teal-800/10 text-teal-800 transition-all hover:ring-2 hover:ring-teal-800/30"
            >
              <UserCircle size={20} />
            </Link>
          </>
        ) : (
          <IconButton href="/login" label="Login">
            <LogIn size={19} />
          </IconButton>
        )}

        <Link
          href="/sell"
          className="ml-2 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-amber-600/20 transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-amber-600/30 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">Sell</span>
        </Link>
      </div>
    </header>
  );
}

function IconButton({
  href,
  label,
  children,
  dot = false,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-all hover:bg-stone-200/60 hover:text-stone-900"
    >
      {children}
      {dot && (
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-500 border border-stone-50" />
      )}
    </Link>
  );
}