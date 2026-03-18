import React, { useMemo, useState } from "react";

// Assign a consistent color per category
const CATEGORY_COLORS = {
  whisky: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-400",
  },
  beer: {
    bg: "bg-lime-50",
    border: "border-lime-300",
    text: "text-lime-800",
    dot: "bg-lime-500",
  },
  vodka: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    dot: "bg-sky-400",
  },
  rum: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
    dot: "bg-orange-400",
  },
  gin: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-800",
    dot: "bg-teal-400",
  },
  brandy: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    dot: "bg-red-400",
  },
  wine: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    dot: "bg-purple-400",
  },
  alcopop: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-800",
    dot: "bg-pink-400",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-slate-50",
  border: "border-slate-200",
  text: "text-slate-700",
  dot: "bg-slate-400",
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-1 pb-3 shrink-0">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drink..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition focus-brand"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap pb-3 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
              activeCategory === cat
                ? "text-white border-transparent"
                : "bg-white text-slate-600 border-gray-200 hover:text-white"
            }`}
            style={
              activeCategory === cat
                ? {
                    backgroundColor: "#00ADB5",
                    borderColor: "#00ADB5",
                    color: "white",
                  }
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

      {/* Product grid — scrollable */}
      <div className="overflow-y-auto flex-1 pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
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
                {/* Initials avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${color.dot}`}
                >
                  {getInitials(product?.name)}
                </div>

                <div className="leading-tight">
                  <p
                    className={`text-xs font-bold uppercase ${color.text} line-clamp-2 leading-snug`}
                  >
                    {product?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {product?.unitSize}
                  </p>
                </div>

                <p className="text-xs font-extrabold text-slate-800">
                  ₹{product?.basePrice?.toFixed(0)}
                </p>

                {/* Stock badge */}
                <span
                  className={`absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    outOfStock
                      ? "bg-red-100 text-red-500"
                      : "bg-white/70 text-slate-500"
                  }`}
                >
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
