"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Heart, HeartOff } from "lucide-react";

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Wishlist se product IDs nikalo
      const { data: wishlistData } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", session.user.id);

      if (wishlistData && wishlistData.length > 0) {
        const productIds = wishlistData.map(item => item.product_id);
        
        // 2. Un products ki details nikalo
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        setWishlistProducts(products || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from("wishlist").delete().match({ user_id: session.user.id, product_id: productId });
    setWishlistProducts(wishlistProducts.filter(p => p.id !== productId));
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-50"><p className="text-stone-500">Loading wishlist...</p></div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="mb-6 text-2xl font-black text-stone-900">My Saved Items ({wishlistProducts.length})</h1>

        {wishlistProducts.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white py-16 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="text-stone-500">Your wishlist is empty.</p>
            <Link href="/" className="mt-4 inline-block rounded-lg bg-teal-800 px-4 py-2 text-sm font-bold text-white">Explore Items</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <Link href={`/product/${product.id}`} className="block aspect-square bg-stone-100">
                  <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                </Link>
                <div className="p-4">
                  <h3 className="truncate font-bold text-stone-900">{product.title}</h3>
                  <p className="font-bold text-teal-700">₹{product.price}</p>
                </div>
                <button onClick={() => handleRemove(product.id)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-500 shadow-md hover:scale-110">
                  <HeartOff size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}