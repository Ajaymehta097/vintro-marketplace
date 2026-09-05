"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Home,
  LayoutGrid,
  MessageCircle,
  Heart,
  UserCircle,
  PlusCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: LayoutGrid },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let channel: any;

    const checkUnreadMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // 1. Page load hone par check karo ki koi unread message hai ya nahi
      const { data } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', userId)
        .eq('is_read', false)
        .limit(1);

      if (data && data.length > 0) {
        setHasUnread(true);
      }

      // 2. 🔴 REAL-TIME: React Strict mode double-fire error se bachne ke liye unique channel name
      const uniqueChannelName = `sidebar-unread-${Date.now()}`;
      
      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            if (payload.new.sender_id !== userId) {
              setHasUnread(true);
            }
          }
        )
        .subscribe();
    };

    checkUnreadMessages();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Agar user /chat page par chala gaya hai, toh dot hata do
  useEffect(() => {
    if (pathname.startsWith("/chat")) {
      setHasUnread(false);
    }
  }, [pathname]);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-stone-200 bg-stone-50 md:flex shadow-sm"
      aria-label="Primary"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-lg font-bold text-stone-50 shadow-md">
          V
        </span>
        <span className="text-2xl font-bold tracking-tight text-stone-900">
          Vintro
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1.5 px-4 mt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 ${
                active
                  ? "bg-teal-800/10 font-semibold text-teal-800"
                  : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className={`transition-colors ${
                    active ? "text-teal-800" : "text-stone-400 group-hover:text-stone-600"
                  }`}
                />
                
                {/* 🌟 CHAT ICON PAR NOTIFICATION DOT */}
                {label === "Chat" && hasUnread && (
                  <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-stone-50"></span>
                  </span>
                )}
              </div>
              
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sell CTA */}
      <div className="border-t border-stone-200 p-5 bg-stone-100/50">
        <Link
          href="/sell"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-bold text-white transition-all shadow-sm hover:bg-amber-700 hover:shadow-md active:scale-95"
        >
          <PlusCircle size={18} strokeWidth={2.5} />
          Sell an item
        </Link>
      </div>
    </aside>
  );
}