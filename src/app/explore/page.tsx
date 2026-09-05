"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";

export default function ExplorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search aur Filter ke states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Aap yahan apni marzi se categories change kar sakte hain
  const categories = ["All", "Electronics", "Fashion", "Home", "Vintage", "Books"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Jab bhi user search bar mein likhe ya category change kare, toh list update ho
  useEffect(() => {
    let result = products;

    if (activeCategory !== "All") {
      result = result.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery) {
      result = result.filter(
        p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, products]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="font-medium text-stone-500">Loading explore page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-stone-900">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-2xl font-black text-stone-900">Explore Items</h1>
        </div>

        {/* Search Bar & Categories */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search for vintage TVs, watches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm focus:border-teal-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-teal-800 text-white shadow-md' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white py-16 text-center shadow-sm">
            <Filter className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <p className="text-stone-500">No items found matching your search.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="mt-4 text-sm font-bold text-teal-700 hover:underline">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="aspect-square bg-stone-100">
                  <img src={product.image_url} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="truncate font-bold text-stone-900">₹{product.price}</h3>
                  <p className="truncate text-sm text-stone-600">{product.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}