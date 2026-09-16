"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; 
import LoginPage from "./login/page";
import { LogOut, User, PlusCircle, Heart, MapPin, LocateFixed, Search } from "lucide-react"; 
import Image from "next/image"; // 🌟 NAYA IMPORT: Next.js Image component

export default function Home() {
  const router = useRouter(); 
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const [selectedLocation, setSelectedLocation] = useState("India");
  const [isLocating, setIsLocating] = useState(false);
  const [cities, setCities] = useState(["India", "Mandsaur", "Uplai", "Indore", "Delhi", "Mumbai"]);

  // 🌟 Naya useEffect jo page load hote hi automatically location permission maangega
  useEffect(() => {
    // 1. Auth & Data Fetching
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (session) {
        fetchProducts(); 
        fetchWishlist(session.user.id); 
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProducts();
        fetchWishlist(session.user.id);
      }
    });

    // 2. 🚀 Page Load Hote Hi Automatic Location Detect Karna
    handleAutoLocation(true); // 'true' ka matlab yeh initial load hai (silently fail hoga agar user deny kare)

    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchWishlist = async (userId: string) => {
    try {
      const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", userId);
      if (data) setWishlist(data.map(item => item.product_id));
    } catch (error) {}
  };

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); 
    if (!session) return;
    const isLiked = wishlist.includes(productId);
    const userId = session.user.id;

    if (isLiked) {
      setWishlist(wishlist.filter(id => id !== productId));
      await supabase.from("wishlist").delete().match({ user_id: userId, product_id: productId });
    } else {
      setWishlist([...wishlist, productId]);
      await supabase.from("wishlist").insert([{ user_id: userId, product_id: productId }]);
    }
  };

  // 📍 GPS Location Logic
  const handleAutoLocation = (isInitialLoad = false) => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            const address = data.address;
            // Gaon (Village), Town, City ya District dhoondhega
            const detectedCity = address.village || address.town || address.city || address.county || address.state_district || "Unknown";

            if (!cities.includes(detectedCity)) {
              setCities(prev => [detectedCity, ...prev]);
            }
            setSelectedLocation(detectedCity);
          } catch (error) {
            if (!isInitialLoad) alert("Location detected, but couldn't get city name.");
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          if (!isInitialLoad) alert("Please allow location access in your browser to see nearby items.");
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  if (loadingAuth) return <div className="flex min-h-screen items-center justify-center bg-stone-50"><p className="font-medium text-stone-500">Loading Vintro...</p></div>;
  if (!session) return <LoginPage />;

  const displayProducts = selectedLocation === "India" ? products : products.filter(p => p.location === selectedLocation);

  return (
    <div className="min-h-screen bg-stone-50">
      
      {/* 🌟 NAYA RESPONSIVE HEADER */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white shadow-sm">
        {/* Container: Mobile par column (stack) aur Desktop par row banega */}
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          
          {/* Top Row (Mobile): Logo + Right Icons */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-2xl font-black tracking-tighter text-teal-800">VINTRO</h1>
            
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <button onClick={() => router.push("/sell")} className="hidden md:flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-700"><PlusCircle size={16} /> Sell</button>
              <button onClick={() => router.push("/sell")} className="md:hidden rounded-full p-2 text-amber-600 bg-amber-50"><PlusCircle size={20} /></button>
              <button onClick={() => router.push("/wishlist")} className="rounded-full p-2 text-stone-500 hover:bg-red-50 hover:text-red-500"><Heart size={20} /></button>
              <button onClick={() => router.push("/profile")} className="rounded-full p-2 text-stone-500 hover:bg-stone-100"><User size={20} /></button>
              <button onClick={() => supabase.auth.signOut()} className="rounded-full p-2 text-red-500 hover:bg-red-50"><LogOut size={20} /></button>
            </div>
          </div>
          
          {/* Bottom Row (Mobile) / Middle (Desktop): Location & Search */}
          <div className="flex w-full flex-1 items-center md:max-w-2xl">
            {/* 📍 Location Dropdown */}
            <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-l-lg border border-stone-200 bg-stone-50 px-2 sm:px-3 hover:bg-stone-100 transition-colors">
              <MapPin size={16} className="text-teal-700 shrink-0" />
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)} 
                className="w-16 bg-transparent text-sm font-bold text-stone-700 outline-none cursor-pointer sm:w-20 md:w-24 truncate"
              >
                {Array.from(new Set(cities)).map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
              
              <button 
                onClick={() => handleAutoLocation(false)} 
                title="Detect Current Location" 
                className={`shrink-0 text-stone-400 hover:text-teal-700 transition-colors ${isLocating ? 'animate-pulse text-teal-700' : ''}`}
              >
                <LocateFixed size={14} />
              </button>
            </div>

            {/* 🔍 Search Bar */}
            <div 
              onClick={() => router.push('/explore')}
              className="flex h-10 flex-1 cursor-pointer items-center gap-2 overflow-hidden rounded-r-lg border border-l-0 border-stone-200 bg-white px-3 text-stone-400 transition-colors hover:bg-stone-50 sm:px-4"
            >
              <Search size={16} className="shrink-0" />
              <span className="truncate text-sm">Search 'vintage TV'...</span>
            </div>
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-xl font-bold text-stone-900">{selectedLocation === "India" ? "Fresh Recommendations" : `Items near ${selectedLocation}`}</h2>

        {loadingProducts ? (
          <div className="py-20 text-center text-stone-500">Loading vintage items...</div>
        ) : displayProducts.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white py-20 text-center shadow-sm">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="mb-4 text-stone-500">No items available in {selectedLocation}.</p>
            <button onClick={() => setSelectedLocation("India")} className="font-bold text-teal-700 hover:underline">See items from All India</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => {
              const isLiked = wishlist.includes(product.id);
              return (
                <div key={product.id} onClick={() => router.push(`/product/${product.id}`)} className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow-md cursor-pointer flex flex-col h-full">
                  <button onClick={(e) => toggleWishlist(e, product.id)} className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-400 hover:scale-110 hover:text-red-500">
                    <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                  </button>
                  <div className="relative aspect-square overflow-hidden bg-stone-100 shrink-0">
                    {/* 🌟 NAYA: Next.js Image component added here */}
                    <Image 
                      src={product.image_url || "https://placehold.co/400x400/eeeeee/999999?text=No+Image"} 
                      alt={product.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div className="p-4 flex flex-col grow">
                    <h3 className="truncate text-lg font-bold text-stone-900">₹{product.price}</h3>
                    <p className="mt-0.5 truncate text-sm text-stone-600">{product.title}</p>
                    <div className="mt-auto pt-3 flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {product.location || 'India'}</span>
                      <span>{product.condition || 'Used'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}