import React, { useMemo, useState } from "react";
import { Beer, Wine, GlassWater, CupSoda, Beaker } from "lucide-react";

// Assign a consistent color per category
const CATEGORY_COLORS = {
  whisky: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-400",
    icon: Wine,
  },
  beer: {
    bg: "bg-lime-50",
    border: "border-lime-300",
    text: "text-lime-800",
    dot: "bg-lime-500",
    icon: Beer,
  },
  vodka: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    dot: "bg-sky-400",
    icon: GlassWater,
  },
  rum: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
    dot: "bg-orange-400",
    icon: Wine,
  },
  gin: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-800",
    dot: "bg-teal-400",
    icon: GlassWater,
  },
  brandy: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    dot: "bg-red-400",
    icon: Wine,
  },
  wine: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    dot: "bg-purple-400",
    icon: Wine,
  },
  alcopop: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-800",
    dot: "bg-pink-400",
    icon: CupSoda,
  },
};

const DEFAULT_COLOR = {
  bg: "bg-slate-50",
  border: "border-slate-200",
  text: "text-slate-700",
  dot: "bg-slate-400",
  icon: Beaker,
};

const getColor = (category) =>
  CATEGORY_COLORS[category?.toLowerCase()] || DEFAULT_COLOR;

/** Derive initials from a product name — e.g. "Blenders Pride" → "BP" */
const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const POSProductGrid = ({ inventory, onAdd }) => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  // Derive sorted unique categories from the inventory
  const categories = useMemo(() => {
    const cats = [
      ...new Set(inventory.map((i) => i.product?.category).filter(Boolean)),
    ].sort();
    return ["ALL", ...cats];
  }, [inventory]);

  // Filter by category + search
  const filtered = useMemo(() => {
    return inventory.filter((inv) => {
      const cat = inv.product?.category?.toLowerCase() || "";
      const name = inv.product?.name?.toLowerCase() || "";
      const matchCat =
        activeCategory === "ALL" || cat === activeCategory.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [inventory, activeCategory, search]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Search + Category tabs row on mobile */}
      <div className="shrink-0 px-1 pb-2 flex flex-col gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drink..."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none transition focus-brand"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap pb-2 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize transition-all ${
              activeCategory === cat
                ? "text-white border-transparent"
                : "bg-white text-slate-600 border-gray-200 hover:text-white"
            }`}
            style={
              activeCategory === cat
                ? { backgroundColor: "#00ADB5", borderColor: "#00ADB5", color: "white" }
                : {}
            }
            onMouseEnter={(e) => {
              if (activeCategory !== cat) {
                e.currentTarget.style.borderColor = "#00ADB5";
                e.currentTarget.style.color = "#00ADB5";
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== cat) {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.color = "";
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── MOBILE: horizontal scroll row of compact cards ── */}
      <div className="lg:hidden overflow-x-auto flex-none pb-1">
        <div className="flex gap-2 w-max">
          {filtered.length === 0 && (
            <p className="text-slate-400 text-sm py-2 px-1">No products found.</p>
          )}
          {filtered.map((inv) => {
            const product = inv.product;
            const color = getColor(product?.category);
            const outOfStock = inv.quantity <= 0;
            return (
              <button
                key={inv.id}
                disabled={outOfStock}
                onClick={() =>
                  onAdd({
                    productId: product.id,
                    name: product.name,
                    category: product.category,
                    unitSize: product.unitSize,
                    price: product.basePrice,
                    stock: inv.quantity,
                  })
                }
                className={`relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border-2 text-center transition-all select-none w-[80px] shrink-0 ${
                  outOfStock
                    ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                    : `${color.bg} ${color.border} active:scale-95 cursor-pointer`
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${color.dot}`}>
                  <color.icon size={12} strokeWidth={2.5} />
                </div>
                <p className={`text-[9px] font-bold uppercase ${color.text} line-clamp-2 leading-tight w-full`}>
                  {product?.name}
                </p>
                <p className="text-[10px] font-extrabold text-slate-800">₹{product?.basePrice?.toFixed(0)}</p>
                <span className={`absolute top-1 right-1 text-[8px] font-semibold px-1 rounded-full ${
                  outOfStock ? "bg-red-100 text-red-500" : "bg-white/70 text-slate-500"
                }`}>
                  {outOfStock ? "OUT" : `×${inv.quantity}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP: vertical scrollable grid ── */}
      <div className="hidden lg:block overflow-y-auto flex-1 pr-1">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-10 text-sm">
              No products found.
            </p>
          )}
          {filtered.map((inv) => {
            const product = inv.product;
            const color = getColor(product?.category);
            const outOfStock = inv.quantity <= 0;

            return (
              <button
                key={inv.id}
                disabled={outOfStock}
                onClick={() =>
                  onAdd({
                    productId: product.id,
                    name: product.name,
                    category: product.category,
                    unitSize: product.unitSize,
                    price: product.basePrice,
                    stock: inv.quantity,
                  })
                }
                className={`relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 rounded-2xl border-2 text-center transition-all select-none ${
                  outOfStock
                    ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                    : `${color.bg} ${color.border} hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer`
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${color.dot}`}>
                  <color.icon size={16} strokeWidth={2.5} />
                </div>
                <div className="leading-tight">
                  <p className={`text-xs font-bold uppercase ${color.text} line-clamp-2 leading-snug`}>
                    {product?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{product?.unitSize}</p>
                </div>
                <p className="text-xs font-extrabold text-slate-800">₹{product?.basePrice?.toFixed(0)}</p>
                <span className={`absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  outOfStock ? "bg-red-100 text-red-500" : "bg-white/70 text-slate-500"
                }`}>
                  {outOfStock ? "OUT" : `×${inv.quantity}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default POSProductGrid;
