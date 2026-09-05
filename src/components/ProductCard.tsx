import { Product } from "@/lib/types";

// Vintro Theme Gradients for different categories
const CATEGORY_GRADIENTS: Record<string, string> = {
  "Old Money": "from-teal-800 via-teal-700 to-amber-600/40",
  "Vintage TV": "from-amber-700 via-amber-600 to-teal-800/30",
  "Denim": "from-slate-700 via-slate-500 to-amber-600/30",
  "Vinyl Records": "from-stone-900 via-stone-700 to-amber-600/40",
  "Furniture": "from-amber-900 via-amber-700 to-teal-800/20",
  "Cameras": "from-teal-900 via-teal-700 to-amber-600/30",
  "Watches": "from-yellow-900 via-amber-700 to-teal-800/30",
};

const FALLBACK_GRADIENT = "from-teal-800 via-amber-600/40 to-teal-700";

export default function ProductCard({ product }: { product: Product }) {
  const gradient = CATEGORY_GRADIENTS[product.category] ?? FALLBACK_GRADIENT;

  return (
    <article className="group cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image placeholder — swap for <Image src={product.imageUrl} /> later */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
        {/* subtle texture overlay so the gradient doesn't look flat */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm italic text-white/80 tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Ticket-stub price tag */}
        <div className="absolute bottom-3 left-3 flex items-center rounded-lg bg-stone-900/85 px-3 py-1.5 text-white backdrop-blur-md shadow-sm">
          <span className="text-sm font-medium tabular-nums tracking-wide">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-stone-700 shadow-sm uppercase tracking-wider">
          {product.condition}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 px-4 py-4 bg-white">
        <p className="truncate text-sm font-semibold text-stone-900 transition-colors group-hover:text-teal-800">
          {product.title}
        </p>
        <p className="text-xs font-medium text-stone-500">{product.location}</p>
      </div>
    </article>
  );
}