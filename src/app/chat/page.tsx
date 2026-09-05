"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatInboxPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setCurrentUser(session.user);

      // User ki saari chats nikal rahe hain (chahe wo buyer ho ya seller)
      const { data: chatData, error } = await supabase
        .from("chats")
        .select("*, products(*)")
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChats(chatData || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-teal-700" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-black text-stone-900">
            <MessageSquare size={24} className="text-teal-700" /> My Chats
          </h1>
        </div>

        {/* Chat List */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {chats.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No messages yet. Start browsing items to chat!</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-stone-100">
              {chats.map((chat) => {
                const product = chat.products;
                const isBuyer = chat.buyer_id === currentUser?.id;
                const roleText = isBuyer ? "Buying" : "Selling";

                return (
                  <Link 
                    key={chat.id} 
                    href={`/chat/${chat.id}`}
                    className="flex items-center gap-4 p-4 transition-all hover:bg-stone-50"
                  >
                    {/* Product Image Mini */}
                    {product ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="h-16 w-16 rounded-xl border border-stone-200 object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-stone-200" />
                    )}
                    
                    {/* Chat Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-bold text-stone-900">{product?.title || "Item Unavailable"}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${isBuyer ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                          {roleText}
                        </span>
                        <p className="text-sm text-stone-500">Click to view conversation</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}