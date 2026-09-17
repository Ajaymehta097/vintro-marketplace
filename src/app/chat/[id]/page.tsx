"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MessageSquare, Paperclip, MapPin, MoreVertical, Trash2, Edit2, X } from "lucide-react";
import Link from "next/link";

export default function ChatRoomPage() {
  const { id: chatId } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatDetails, setChatDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Naye States Edit aur Media ke liye
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) initChat();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initChat = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      setCurrentUser(session.user);

      const { data: chatData, error: chatError } = await supabase
        .from("chats").select("*, products(*)").eq("id", chatId).maybeSingle();

      if (chatError || !chatData) {
        alert("Chat session not found.");
        return router.push("/");
      }
      setChatDetails(chatData);

      const { data: msgData } = await supabase
        .from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
      setMessages(msgData || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Text Message Bhejna ya Edit Karna
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      if (editingMsgId) {
        // Edit Mode
        const { data } = await supabase.from("messages")
          .update({ text: textToSend, is_edited: true })
          .eq("id", editingMsgId).select().single();
        
        if (data) {
          setMessages(messages.map(m => m.id === editingMsgId ? data : m));
        }
        setEditingMsgId(null);
      } else {
        // Normal Send
        const { data } = await supabase.from("messages").insert([{
          chat_id: chatId, sender_id: currentUser.id, text: textToSend
        }]).select().single();
        
        if (data) setMessages((prev) => [...prev, data]);
      }
    } catch (error) {
      alert("Failed to send message.");
    }
  };

  // 2. Media (Image/Video) Upload Karna
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("chat_media").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("chat_media").getPublicUrl(fileName);
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      const { data } = await supabase.from("messages").insert([{
        chat_id: chatId, sender_id: currentUser.id, text: "📷 Media", 
        media_url: publicUrlData.publicUrl, media_type: mediaType
      }]).select().single();

      if (data) setMessages((prev) => [...prev, data]);
    } catch (error) {
      alert("Failed to upload media.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Location Bhejna
  const handleSendLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");
    
    setIsUploading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      try {
        const { data } = await supabase.from("messages").insert([{
          chat_id: chatId, sender_id: currentUser.id, text: "📍 My Location", 
          media_url: locationUrl, media_type: "location"
        }]).select().single();
        if (data) setMessages((prev) => [...prev, data]);
      } catch (error) {
        alert("Failed to send location");
      } finally {
        setIsUploading(false);
      }
    });
  };

  // 4. Delete Message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await supabase.from("messages").delete().eq("id", id);
      setMessages(messages.filter(m => m.id !== id));
    } catch (error) {
      alert("Failed to delete message");
    }
    setActiveMenuId(null);
  };

  // Date Formatting Helper (WhatsApp style date grouping)
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-stone-50"><p>Loading chat room...</p></div>;

  const product = chatDetails?.products;
  let lastDateHeader = "";

  return (
    <div className="flex flex-col h-screen bg-[#EFEAE2]"> {/* WhatsApp style background color */}
      
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-2 text-stone-500 hover:bg-stone-100"><ArrowLeft size={20} /></Link>
          {product && (
            <div className="flex items-center gap-3">
              <img src={product.image_url} alt={product.title} className="h-10 w-10 rounded-full object-cover border border-stone-200" />
              <div>
                <h2 className="text-sm font-bold text-stone-900 truncate max-w-[200px] md:max-w-md">{product.title}</h2>
                <p className="text-xs font-bold text-teal-700">₹{product.price}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full mx-auto pb-20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <MessageSquare size={40} className="mb-2 opacity-40" />
            <p className="text-sm bg-white/60 px-4 py-2 rounded-xl">No messages yet. Say hello to the seller! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.id;
            const currentMsgDate = formatDateHeader(msg.created_at);
            const showDateHeader = currentMsgDate !== lastDateHeader;
            if (showDateHeader) lastDateHeader = currentMsgDate;

            return (
              <div key={msg.id} className="flex flex-col">
                {showDateHeader && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white/80 text-stone-600 text-xs font-medium px-3 py-1 rounded-lg shadow-sm">
                      {currentMsgDate}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 group relative`}>
                  <div className={`relative max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${isMe ? "bg-[#D9FDD3] text-stone-900 rounded-tr-none" : "bg-white text-stone-900 rounded-tl-none"}`}>
                    
                    {/* Media Rendering */}
                    {msg.media_type === "image" && <img src={msg.media_url} className="w-full max-w-sm rounded-lg mb-2" alt="Uploaded photo" />}
                    {msg.media_type === "video" && <video src={msg.media_url} controls className="w-full max-w-sm rounded-lg mb-2" />}
                    {msg.media_type === "location" && (
                      <a href={msg.media_url} target="_blank" className="flex items-center gap-2 bg-blue-50 text-blue-600 p-3 rounded-lg mb-2 hover:bg-blue-100">
                        <MapPin size={20} /> View Location on Map
                      </a>
                    )}
                    
                    {/* Message Text */}
                    {msg.text !== "📷 Media" && msg.text !== "📍 My Location" && (
                      <p className="break-words pr-2">{msg.text}</p>
                    )}

                    {/* Time & Edited Status */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? "text-green-700/70" : "text-stone-400"}`}>
                      {msg.is_edited && <span>(edited)</span>}
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* 3-Dot Menu for Edit/Delete (Only for own messages) */}
                    {isMe && (
                      <button onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)} className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 transition-opacity">
                        <MoreVertical size={16} />
                      </button>
                    )}

                    {/* Dropdown Menu */}
                    {activeMenuId === msg.id && (
                      <div className="absolute -left-32 top-6 bg-white shadow-lg rounded-xl border border-stone-100 overflow-hidden z-20 flex flex-col w-28">
                        {msg.media_type === null && (
                          <button onClick={() => { setEditingMsgId(msg.id); setNewMessage(msg.text); setActiveMenuId(null); }} className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                        <button onClick={() => handleDeleteMessage(msg.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Container */}
      <div className="absolute bottom-0 left-0 w-full bg-[#EFEAE2] p-2 sm:p-4">
        {editingMsgId && (
          <div className="mx-auto max-w-4xl bg-white rounded-t-xl px-4 py-2 border-b border-stone-100 flex justify-between items-center text-sm text-teal-800 font-medium">
            <span>Editing message...</span>
            <button onClick={() => { setEditingMsgId(null); setNewMessage(""); }}><X size={18} className="text-stone-400 hover:text-red-500" /></button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl items-center gap-2">
          
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-stone-500 bg-white rounded-full hover:bg-stone-50 shadow-sm" disabled={isUploading}>
            <Paperclip size={20} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />

          <button type="button" onClick={handleSendLocation} className="p-3 text-stone-500 bg-white rounded-full hover:bg-stone-50 shadow-sm" disabled={isUploading}>
            <MapPin size={20} />
          </button>

          <input 
            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isUploading ? "Uploading..." : "Type a message"}
            disabled={isUploading}
            className="flex-1 rounded-full border-0 bg-white px-5 py-3.5 text-sm text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          />
          
          <button type="submit" disabled={isUploading || !newMessage.trim()} className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-800 text-white shadow-sm hover:bg-teal-900 disabled:opacity-50 transition-all">
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>

    </div>
  );
}