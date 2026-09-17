"use client";

import { useState, useEffect, useRef } from "react";
import { Save, ArrowLeft, MapPin, LocateFixed, Loader2, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState(""); 
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  
  // 🌟 NAYE STATES PHOTO UPLOAD KE LIYE
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cities, setCities] = useState(["Mandsaur", "Neemuch", "Ratlam", "Indore", "Ujjain", "Bhopal", "Chittorgarh", "Jaipur", "Delhi", "Mumbai"]);
  const defaultCategories = ["Old Money", "Vintage TV", "Denim", "Vinyl Records", "Furniture", "Cameras", "Watches"];

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (product.seller_id !== session.user.id) {
        alert("You are not authorized to edit this product.");
        router.push("/profile");
        return;
      }

      setTitle(product.title);
      setPrice(product.price.toString());
      setCondition(product.condition);
      setLocation(product.location);
      setDescription(product.description);
      setCoverImage(product.image_url);
      setPreviewImage(product.image_url); // Preview mein purani photo set karo

      if (defaultCategories.includes(product.category)) {
        setCategory(product.category);
      } else {
        setCategory("Other");
        setCustomCategory(product.category);
      }

      if (!cities.includes(product.location)) {
        setCities([product.location, ...cities]);
      }

    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Product not found or error loading details.");
      router.push("/profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            const address = data.address;
            const detectedCity = address.village || address.town || address.city || address.county || address.state_district || "Unknown";

            if (!cities.includes(detectedCity)) {
              setCities([detectedCity, ...cities]);
            }
            setLocation(detectedCity);
          } catch (error) {
            alert("Could not fetch city name. Please try manually.");
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          alert("Please allow Location Access!");
          setIsLocating(false);
        }
      );
    } else {
      alert("Your browser doesn't support geolocation.");
      setIsLocating(false);
    }
  };

  // 🌟 NAYA FUNCTION: Photo select karte hi preview dikhane ke liye
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalCategory = category === "Other" ? customCategory : category;
      let finalImageUrl = coverImage; // By default purani photo rakhein

      // 🌟 AGAR NAYI PHOTO CHUNI HAI, TOH PEHLE UPLOAD KARO
      if (newImageFile) {
        const fileExt = newImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product_images")
          .upload(filePath, newImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product_images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl; // Nayi photo ka URL set karo
      }

      // 🌟 DATABASE UPDATE KARO
      const { error } = await supabase
        .from("products")
        .update({
          title: title,
          price: Number(price),
          category: finalCategory,
          condition: condition,
          location: location,
          description: description,
          image_url: finalImageUrl, // Yahan photo update hogi
        })
        .eq("id", id);

      if (error) throw error;

      alert("Product updated successfully! 🚀");
      router.push("/profile");
    } catch (error: any) {
      alert("Error updating product: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-teal-700" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <Link href="/profile" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowLeft size={16} /> Back to Profile
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight text-stone-900">Edit Listing</h1>
      <p className="mb-8 text-sm text-stone-500">Update your product details and price.</p>

      <form onSubmit={handleUpdate} className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        
        {/* 🌟 NAYA: INTERACTIVE IMAGE UPLOAD SECTION */}
        <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
            <img src={previewImage || "https://placehold.co/400x400/eeeeee/999999.png?text=No+Image"} alt="Cover" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col items-start gap-2">
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Product Image</p>
              <p className="text-sm text-stone-600">Upload a new photo to replace the current one.</p>
            </div>
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-100"
            >
              <ImagePlus size={16} /> Change Photo
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Item Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Price (₹)</label>
            <input required type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none">
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Repair">Needs Repair</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none">
              {defaultCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Other">Other (Type your own)</option>
            </select>

            {category === "Other" && (
              <input 
                type="text" 
                required 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)} 
                placeholder="Type your category..." 
                className="mt-3 w-full rounded-lg border border-teal-500 bg-white px-4 py-3 text-sm shadow-sm focus:border-teal-700 outline-none transition-all" 
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
              <span className="flex items-center gap-1"><MapPin size={14} /> City</span>
              <button 
                type="button" 
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-teal-700 hover:text-teal-900 transition-colors"
              >
                <LocateFixed size={12} className={isLocating ? "animate-spin" : ""} /> 
                {isLocating ? "Locating..." : "Auto Detect"}
              </button>
            </label>
            <select value={location || ""} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none">
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none" />
        </div>

        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-teal-900 disabled:opacity-70">
          <Save size={18} />
          {isSubmitting ? "Saving Changes..." : "Update Listing"}
        </button>
      </form>
    </div>
  );
}