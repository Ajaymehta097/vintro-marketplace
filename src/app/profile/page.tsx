"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Phone, FileText, Save, ArrowLeft, Trash2, Package, Heart, HeartOff, CheckCircle, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // 🌟 NAYA IMPORT

export default function ProfilePage() {
  const router = useRouter();
  
  // Profile States
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("user");

  // Dashboard States
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const user = session.user;
      setEmail(user.email || "");

      // 1. Fetch Profile Data
      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name || user.user_metadata?.full_name || "");
        setPhone(profileData.phone || "");
        setBio(profileData.bio || "");
        setRole(profileData.role || "user");
      }

      // 2. Fetch User's Listings
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      
      setMyProducts(productsData || []);

      // 3. Fetch User's Wishlist
      const { data: wishlistData } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id);

      if (wishlistData && wishlistData.length > 0) {
        const productIds = wishlistData.map(item => item.product_id);
        
        const { data: savedProducts } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);
          
        setWishlistProducts(savedProducts || []);
      }

    } catch (error) {
      console.error("Error loading dashboard!", error);
      toast.error("Failed to load dashboard data."); // 🌟 TOAST ADDED
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const updates = {
        id: session.user.id,
        full_name: fullName,
        email: email,
        phone: phone,
        bio: bio,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      toast.success("Profile updated successfully!"); // 🌟 TOAST ADDED
    } catch (error: any) {
      toast.error("Error updating the profile!"); // 🌟 TOAST ADDED
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      
      toast.success("Listing removed successfully!"); // 🌟 TOAST ADDED
      setMyProducts(myProducts.filter(p => p.id !== productId));
    } catch (error: any) {
      toast.error("Error deleting product."); // 🌟 TOAST ADDED
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from("wishlist").delete().match({ user_id: session.user.id, product_id: productId });
      setWishlistProducts(wishlistProducts.filter(p => p.id !== productId));
      toast.success("Removed from wishlist"); // 🌟 TOAST ADDED (Optional, but good for feedback)
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Could not remove item."); // 🌟 TOAST ADDED
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Sold' ? 'Available' : 'Sold';
    try {
      const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", productId);
      if (error) throw error;
      
      setMyProducts(myProducts.map(p => p.id === productId ? { ...p, status: newStatus } : p));
      toast.success(`Marked as ${newStatus}`); // 🌟 TOAST ADDED
    } catch (error) {
      toast.error("Error updating status!"); // 🌟 TOAST ADDED
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="font-medium text-stone-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-stone-900">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT COLUMN: Profile Update Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-6 border-b border-stone-100 pb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
                  <User size={24} className="text-teal-700" /> My Profile
                </h2>
                {role === 'admin' && (
                  <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-1 text-xs font-bold uppercase text-amber-800">
                    Admin Account
                  </span>
                )}
              </div>

              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm text-stone-900 focus:border-teal-700 focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Email (Locked)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="email" disabled value={email} className="w-full cursor-not-allowed rounded-lg border border-stone-200 bg-stone-100 py-2 pl-9 pr-4 text-sm text-stone-500" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm text-stone-900 focus:border-teal-700 focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Bio</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-stone-400" />
                    <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm text-stone-900 focus:border-teal-700 focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={updating} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-900">
                  <Save size={16} /> {updating ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabs (Listings & Wishlist) */}
          <div className="lg:col-span-2">
            
            {/* Tabs Buttons */}
            <div className="mb-6 flex gap-4 border-b border-stone-200 pb-4">
              <button 
                onClick={() => setActiveTab("listings")}
                className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "listings" ? "bg-stone-200 text-stone-900" : "text-stone-500 hover:bg-stone-100"}`}
              >
                <Package size={18} /> My Listings ({myProducts.length})
              </button>
              <button 
                onClick={() => setActiveTab("wishlist")}
                className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "wishlist" ? "bg-red-50 text-red-600" : "text-stone-500 hover:bg-stone-100"}`}
              >
                <Heart size={18} className={activeTab === "wishlist" ? "fill-red-600" : ""} /> Saved Items ({wishlistProducts.length})
              </button>
            </div>

            {/* TAB CONTENT 1: My Listings */}
            {activeTab === "listings" && (
              myProducts.length === 0 ? (
                <div className="rounded-xl border border-stone-200 bg-white py-16 text-center shadow-sm">
                  <p className="mb-4 text-stone-500">You haven't listed any items for sale yet.</p>
                  <Link href="/sell" className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-700">
                    List Your First Item
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {myProducts.map((product) => (
                    <div key={product.id} className={`relative flex overflow-hidden rounded-xl border transition-all hover:shadow-md ${product.status === 'Sold' ? 'border-amber-200 bg-amber-50/30' : 'border-stone-200 bg-white shadow-sm'}`}>
                      
                      {product.status === 'Sold' && (
                        <div className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2.5 py-1 text-[10px] font-black tracking-wider text-white shadow-sm">
                          SOLD OUT
                        </div>
                      )}

                      <div className="relative h-full w-1/3 bg-stone-100">
                        <img src={product.image_url} alt={product.title} className={`h-full w-full object-cover transition-all ${product.status === 'Sold' ? 'opacity-60 grayscale' : ''}`} />
                      </div>
                      <div className="flex w-2/3 flex-col p-4">
                        <h3 className={`truncate font-bold ${product.status === 'Sold' ? 'text-stone-500 line-through' : 'text-stone-900'}`}>{product.title}</h3>
                        <p className={`mb-3 text-lg font-bold ${product.status === 'Sold' ? 'text-stone-400' : 'text-teal-700'}`}>₹{product.price}</p>
                        
                        {/* 🌟 ACTION BUTTONS UPDATED */}
                        <div className="mt-auto flex flex-col gap-2">
                          
                          {/* Row 1: Edit & Delete */}
                          <div className="grid grid-cols-2 gap-2">
                            <Link href={`/edit-product/${product.id}`} className="flex w-full items-center justify-center gap-1 rounded-md bg-blue-50 py-1.5 text-[11px] font-bold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700">
                              <Edit size={14} /> Edit
                            </Link>
                            
                            <button onClick={() => handleDeleteProduct(product.id)} className="flex w-full items-center justify-center gap-1 rounded-md bg-red-50 py-1.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>

                          {/* Row 2: Mark Sold */}
                          <button 
                            onClick={() => toggleProductStatus(product.id, product.status)} 
                            className={`flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-colors ${product.status === 'Sold' ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                          >
                            {product.status === 'Sold' ? <Package size={14} /> : <CheckCircle size={14} />}
                            {product.status === 'Sold' ? 'Make Available' : 'Mark Sold'}
                          </button>
                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB CONTENT 2: Saved Items (Wishlist) */}
            {activeTab === "wishlist" && (
              wishlistProducts.length === 0 ? (
                <div className="rounded-xl border border-stone-200 bg-white py-16 text-center shadow-sm">
                  <Heart className="mx-auto mb-3 h-10 w-10 text-stone-300" />
                  <p className="text-stone-500">Your wishlist is empty.</p>
                  <Link href="/" className="mt-4 inline-block text-sm font-bold text-teal-700 hover:underline">
                    Explore items
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <Link href={`/product/${product.id}`} className="block h-40 w-full bg-stone-100">
                        <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                      </Link>
                      <div className="p-4">
                        <h3 className="truncate font-bold text-stone-900">{product.title}</h3>
                        <p className="font-bold text-teal-700">₹{product.price}</p>
                      </div>
                      
                      {/* Remove from Wishlist Button */}
                      <button 
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        title="Remove from Saved"
                        className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-500 shadow-md transition-transform hover:scale-110"
                      >
                        <HeartOff size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  );
}