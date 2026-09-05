"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ChatRoomPage() {
  const { id: chatId } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatDetails, setChatDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      initChat();
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initChat = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setCurrentUser(session.user);

      // 1. Chat aur Product ki details nikalo
      let { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*, products(*)")
        .eq("id", chatId)
        .maybeSingle();

      if (chatError || !chatData) {
        alert("Chat session not found. Please click 'Contact' from a product page.");
        router.push("/");
        return;
      }

      setChatDetails(chatData);

      // 2. Is chat ke purane messages nikalo
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      setMessages(msgData || []);

    } catch (error) {
      console.error("Error loading chat:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      const { data, error } = await supabase.from("messages").insert([{
        chat_id: chatId,
        sender_id: currentUser.id,
        text: textToSend
      }]).select().single();

      if (error) throw error;
      
      // Naya message turant state mein add karo
      if (data) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="font-medium text-stone-500">Loading chat room...</p>
      </div>
    );
  }

  const product = chatDetails?.products;

  return (
    <div className="flex flex-col h-screen bg-stone-100">
      
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
            <ArrowLeft size={20} />
          </Link>
          
          {product && (
            <div className="flex items-center gap-3">
              <img src={product.image_url} alt={product.title} className="h-10 w-10 rounded-lg object-cover border border-stone-200" />
              <div>
                <h2 className="text-sm font-bold text-stone-900 truncate max-w-[200px] md:max-w-md">{product.title}</h2>
                <p className="text-xs font-bold text-teal-700">₹{product.price}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <MessageSquare size={40} className="mb-2 opacity-40" />
            <p className="text-sm">No messages yet. Say hello to the seller! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? "bg-teal-800 text-white rounded-br-none" : "bg-white text-stone-900 border border-stone-200 rounded-bl-none"}`}>
                  <p className="break-words">{msg.text}</p>
                  <span className={`block text-[10px] mt-1 text-right ${isMe ? "text-teal-200" : "text-stone-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="border-t border-stone-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 focus:border-teal-700 focus:bg-white focus:outline-none"
          />
          <button type="submit" className="flex items-center justify-center rounded-xl bg-teal-800 px-5 text-white transition-all hover:bg-teal-900 shadow-sm">
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}