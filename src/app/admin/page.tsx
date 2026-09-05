"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Package, Users, Trash2, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // 1. Current user ka session check karo
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 2. Database se is user ka 'role' check karo
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        alert("Access Denied! You are not an admin.");
        router.push("/"); // Aam user ko home page par bhej do
        return;
      }

      // Agar admin hai, toh data fetch karo
      setIsAdmin(true);
      fetchProducts();
      fetchUsers();
    } catch (error) {
      console.error("Error checking admin:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  // Product Delete karne ka function
  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      
      alert("Product deleted successfully!");
      fetchProducts(); // List ko update (refresh) karo
    } catch (error: any) {
      alert("Error deleting product: " + error.message);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-50"><p className="text-stone-500">Checking Admin Credentials...</p></div>;
  }

  if (!isAdmin) return null; // Security ke liye agar admin nahi hai toh kuch render mat karo

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-amber-500" />
            <h1 className="text-xl font-bold tracking-wide">Vintro Admin Panel</h1>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Website
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        
        {/* Tabs Control */}
        <div className="mb-6 flex gap-4 border-b border-stone-200 pb-4">
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "products" ? "bg-slate-200 text-slate-900" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <Package size={18} /> Manage Products ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "users" ? "bg-slate-200 text-slate-900" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <Users size={18} /> Registered Users ({users.length})
          </button>
        </div>

        {/* Products Section */}
        {activeTab === "products" && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-100 text-stone-800 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Product Image</th>
                  <th className="px-6 py-4">Title & Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50">
                    <td className="px-6 py-3">
                      <img src={product.image_url} alt={product.title} className="w-12 h-12 rounded object-cover border border-stone-200" />
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-bold text-stone-900">{product.title}</p>
                      <p className="text-xs text-stone-500">{product.category}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold">₹{product.price}</td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Section */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-100 text-stone-800 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-bold text-stone-900">{u.full_name || "Unknown"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}