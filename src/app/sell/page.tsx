"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, X, MapPin, LocateFixed, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // 🌟 NAYA IMPORT

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Vintage TV");
  const [customCategory, setCustomCategory] = useState("");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("Mandsaur"); 
  const [description, setDescription] = useState("");
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [cities, setCities] = useState(["Mandsaur", "Neemuch", "Ratlam", "Indore", "Ujjain", "Bhopal", "Chittorgarh", "Jaipur", "Delhi", "Mumbai"]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast("You need to login first to sell an item!", { icon: '🔒' }); // 🌟 TOAST ADDED
        router.push("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

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
            toast.success("Location detected successfully!"); // 🌟 TOAST ADDED
          } catch (error) {
            toast.error("Could not fetch city name. Please try manually."); // 🌟 TOAST ADDED
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          toast.error("Please allow Location Access in your browser popup!"); // 🌟 TOAST ADDED
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Your browser doesn't support geolocation."); // 🌟 TOAST ADDED
      setIsLocating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      const totalFiles = [...imageFiles, ...newFiles].slice(0, 5);
      setImageFiles(totalFiles);
      
      const newPreviews = totalFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedFiles = imageFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let uploadedUrls: string[] = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`; 

          const { error: uploadError } = await supabase.storage.from("product_images").upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from("product_images").getPublicUrl(filePath);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      } else {
        uploadedUrls.push("https://placehold.co/400x400/eeeeee/999999?text=No+Image");
      }

      const primaryImageUrl = uploadedUrls[0];

      const { error: dbError } = await supabase.from("products").insert([
        {
          title: title,
          price: Number(price),
          category: category === "Other" ? customCategory : category,
          condition: condition,
          location: location, 
          description: description,
          image_url: primaryImageUrl,
          images: uploadedUrls,
          seller_id: user.id,
        },
      ]);

      if (dbError) throw dbError;

      setSuccessMessage("Awesome! Your vintage item is successfully listed! 🎉");
      toast.success("Item listed successfully! 🎉"); // 🌟 TOAST ADDED
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
      toast.error(error.message); // 🌟 TOAST ADDED
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-stone-900">Sell an Item</h1>
      <p className="mb-8 text-sm text-stone-500">Give your pre-loved vintage items a new home.</p>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        
        {errorMessage && <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200">{errorMessage}</div>}

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
            Product Photos (Up to 5)
          </label>
          
          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm">
                <img src={preview} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)} 
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 w-full bg-teal-800/80 px-1 py-0.5 text-center text-[9px] font-bold text-white uppercase tracking-wider">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {imagePreviews.length < 5 && (
              <label htmlFor="dropzone-file" className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 transition-colors hover:bg-stone-100">
                <div className="flex flex-col items-center justify-center text-stone-400">
                  {imagePreviews.length === 0 ? <ImageIcon size={24} className="mb-1" /> : <Plus size={24} className="mb-1" />}
                  <span className="text-[10px] font-bold uppercase">{imagePreviews.length === 0 ? "Upload" : "Add More"}</span>
                </div>
                <input id="dropzone-file" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Item Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Retro Sony Walkman" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Price (₹)</label>
            <input required type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none" />
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
              <option value="Old Money">Old Money</option>
              <option value="Vintage TV">Vintage TV</option>
              <option value="Denim">Denim</option>
              <option value="Vinyl Records">Vinyl Records</option>
              <option value="Furniture">Furniture</option>
              <option value="Cameras">Cameras</option>
              <option value="Watches">Watches</option>
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
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none">
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell buyers about the history..." className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:border-teal-700 focus:bg-white outline-none" />
        </div>

        {successMessage && <div className="rounded-lg bg-teal-50 p-4 text-sm font-medium text-teal-800 border border-teal-200">{successMessage}</div>}

        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-amber-700 disabled:opacity-70">
          <UploadCloud size={18} />
          {isSubmitting ? "Uploading..." : "List Item for Sale"}
        </button>
      </form>
    </div>
  );
}