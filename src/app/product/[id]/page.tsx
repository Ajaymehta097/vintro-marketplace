"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast"; // 🌟 NAYA IMPORT
import { 
  ArrowLeft, 
  User, 
  MessageCircle, 
  Tag, 
  ShieldCheck, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Star 
} from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      if (productData?.seller_id) {
        const { data: sellerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", productData.seller_id)
          .single();
        setSeller(sellerData);
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`*, buyer:profiles!buyer_id(full_name)`)
        .eq("product_id", id)
        .order("created_at", { ascending: false });
        
      if (reviewsData) setReviews(reviewsData);

    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Product not found!"); // 🌟 TOAST ADDED
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!currentUser) {
      toast("Please login to message the seller.", { icon: '🔒' }); // 🌟 TOAST ADDED
      router.push("/login");
      return;
    }

    setIsStartingChat(true);

    try {
      const { data: existingChat } = await supabase
        .from("chats")
        .select("id")
        .eq("product_id", product.id)
        .eq("buyer_id", currentUser.id)
        .single();

      if (existingChat) {
        router.push(`/chat/${existingChat.id}`);
        return;
      }

      const { data: newChat, error: createError } = await supabase
        .from("chats")
        .insert([{
          product_id: product.id,
          buyer_id: currentUser.id,
          seller_id: product.seller_id
        }])
        .select()
        .single();

      if (createError) throw createError;
      router.push(`/chat/${newChat.id}`);
      
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Could not start chat. Please try again."); // 🌟 TOAST ADDED
      setIsStartingChat(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this vintage ${product.title} for ₹${product.price} on Vintro!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Sharing cancelled", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!"); // 🌟 TOAST ADDED
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast("Please login to leave a review.", { icon: '🔒' }); // 🌟 TOAST ADDED
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating."); // 🌟 TOAST ADDED
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { error } = await supabase.from("reviews").insert([{
        product_id: product.id,
        seller_id: product.seller_id,
        buyer_id: currentUser.id,
        rating: rating,
        comment: comment
      }]);

      if (error) throw error;
      
      toast.success("Review submitted successfully! 🎉"); // 🌟 TOAST ADDED
      setRating(0);
      setComment("");
      fetchProductDetails(); 
    } catch (error: any) {
      toast.error("Error submitting review: " + error.message); // 🌟 TOAST ADDED
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="font-medium text-stone-500">Loading details...</p>
      </div>
    );
  }

  if (!product) return null;

  const isMyProduct = currentUser?.id === product.seller_id;
  const displayImages: string[] = 
    product.images && Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : product.image_url 
        ? [product.image_url] 
        : [];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextImage();
    if (distance < -50) prevImage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition-colors hover:text-stone-900">
          <ArrowLeft size={16} /> Back to Listings
        </Link>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 gap-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-2">
          
          <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 touch-pan-y"
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            {product.status === 'Sold' && (
              <div className="absolute left-3 top-3 z-20 rounded bg-red-600 px-3 py-1 text-xs font-black tracking-wider text-white shadow-sm">SOLD OUT</div>
            )}
            
            {displayImages.length > 0 && (
              <img src={displayImages[currentImageIndex]} alt="Product" className={`h-full w-full object-cover transition-all duration-300 select-none ${product.status === 'Sold' ? 'opacity-60 grayscale' : ''}`} draggable={false} />
            )}

            {displayImages.length > 1 && (
              <>
                <button type="button" onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 opacity-100 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 md:opacity-0 md:group-hover:opacity-100"><ChevronLeft size={24} /></button>
                <button type="button" onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-stone-800 opacity-100 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 md:opacity-0 md:group-hover:opacity-100"><ChevronRight size={24} /></button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {displayImages.map((_: string, idx: number) => (
                    <button key={idx} type="button" onClick={() => setCurrentImageIndex(idx)} className={`h-2.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? 'w-8 bg-teal-800' : 'w-2.5 bg-white/80 hover:bg-white'}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-600"><Tag size={12} /> {product.category || 'General'}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-600"><ShieldCheck size={12} /> {product.condition || 'Used'}</span>
            </div>

            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-black text-stone-900">{product.title}</h1>
              <button onClick={handleShare} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-teal-50 hover:text-teal-700" title="Share this item"><Share2 size={20} /></button>
            </div>
            
            <p className="mb-6 text-4xl font-bold text-teal-700">₹{product.price}</p>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-stone-500">Description</h3>
            <p className="mb-8 whitespace-pre-wrap leading-relaxed text-stone-700">{product.description}</p>

            <div className="mt-auto rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800"><User size={24} /></div>
                  <div>
                    <p className="font-bold text-stone-900">{seller?.full_name || "Vintro User"}</p>
                    <p className="text-xs text-stone-500">Verified Seller</p>
                  </div>
                </div>
                
                {isMyProduct ? (
                  <button disabled className="cursor-not-allowed rounded-lg bg-stone-200 px-5 py-2.5 text-sm font-bold text-stone-500">Your Listing</button>
                ) : product.status === 'Sold' ? (
                  <button disabled className="cursor-not-allowed rounded-lg bg-stone-200 px-5 py-2.5 text-sm font-bold text-stone-500">Item Sold</button>
                ) : (
                  <button onClick={handleContactSeller} disabled={isStartingChat} className="flex items-center gap-2 rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-900 disabled:opacity-70">
                    {isStartingChat ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                    {isStartingChat ? "Connecting..." : "Contact"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-bold text-stone-900">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            
            {/* Display Reviews */}
            <div>
              {reviews.length === 0 ? (
                <p className="text-sm text-stone-500">No reviews yet. Be the first to review this item!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-stone-100 pb-6 last:border-0 last:pb-0">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < rev.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-stone-900">{rev.buyer?.full_name || "Vintro User"}</span>
                      </div>
                      <p className="text-sm text-stone-600">{rev.comment}</p>
                      <span className="mt-2 block text-xs text-stone-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            {currentUser && !isMyProduct && (
              <div className="rounded-xl border border-stone-100 bg-stone-50 p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  
                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-600">Rate the Seller & Item</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star size={24} className={(hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-600">Your Comment</label>
                    <textarea 
                      required rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
                      placeholder="How was the product? Did the seller communicate well?"
                      className="w-full resize-none rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm focus:border-teal-700 focus:outline-none" 
                    />
                  </div>

                  <button type="submit" disabled={isSubmittingReview || rating === 0} className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-50">
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}
            
            {/* If not logged in */}
            {!currentUser && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-stone-100 bg-stone-50 p-8 text-center">
                <Star className="mb-3 text-stone-300" size={32} />
                <p className="mb-4 text-sm text-stone-600">Login to leave a review for this item.</p>
                <Link href="/login" className="rounded-lg bg-teal-800 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-teal-900">
                  Login Now
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}