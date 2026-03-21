import React, { useState, useCallback, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

import { useInventory } from "../../hooks/queries/useInventory";
import { useCreateSale } from "../../hooks/queries/useSales";
import POSProductGrid from "../../components/Sales/POSProductGrid";
import POSCart from "../../components/Sales/POSCart";
import SaleSuccessOverlay from "../../components/Sales/SaleSuccessOverlay";

export default function SalesPage() {
  const { data: inventoryData, isLoading, isError, error, refetch: fetchInventory } = useInventory();
  const inventory = Array.isArray(inventoryData?.data) 
    ? inventoryData.data 
    : (Array.isArray(inventoryData) ? inventoryData : []);

  useEffect(() => {
    if (isError) {
      console.error("Sales Terminal Inventory Error:", error);
      const serverMsg = error.response?.data?.message || "Failed to load terminal inventory";
      toast.error(serverMsg);
    }
  }, [isError, error]);
  
  const createSaleMutation = useCreateSale();

  const [cart, setCart] = useState([]); // [{ productId, name, category, unitSize, price, stock, quantity }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSale, setLastSale] = useState(null); // holds the completed sale for Undo overlay

  /* ─── Fetch live inventory handled by React Query ─── */

  /* ─── Cart operations ─── */
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId);
      if (existing) {
        // Already in cart — increment if stock allows
        if (existing.quantity >= item.stock) {
          toast.error("No more stock available for this item.");
          return prev;
        }
        return prev.map((c) =>
          c.productId === item.productId
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const increase = useCallback((productId) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId !== productId) return c;
        if (c.quantity >= c.stock) {
          toast.error("No more stock available.");
          return c;
        }
        return { ...c, quantity: c.quantity + 1 };
      }),
    );
  }, []);

  const decrease = useCallback((productId) => {
    setCart(
      (prev) =>
        prev
          .map((c) =>
            c.productId === productId ? { ...c, quantity: c.quantity - 1 } : c,
          )
          .filter((c) => c.quantity > 0), // auto-remove when hitting 0
    );
  }, []);

  const remove = useCallback((productId) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  /* ─── Checkout ─── */
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    createSaleMutation.mutate(cart, {
      onSuccess: (sale) => {
        setLastSale(sale); // triggers the success overlay
        setCart([]); // clear the cart
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Sale failed. Please try again.",
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  /* ─── Undo completed ─── */
  const handleUndoComplete = () => {
    setLastSale(null); // close overlay
    fetchInventory(); // restore stock on the grid
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center gap-3 bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
        >
          <ShoppingCart size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">
            Sales Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tap items to add to order
          </p>
        </div>
      </div>

      {/* Two-column POS layout */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00ADB5", borderTopColor: "transparent" }}
          />
          Loading inventory...
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-4 gap-2 sm:gap-4">
          {/* TOP/LEFT: Product Grid */}
          <div className="flex-[6] lg:flex-[7] overflow-hidden flex flex-col">
            <POSProductGrid inventory={inventory} onAdd={addToCart} />
          </div>

          {/* BOTTOM/RIGHT: Cart */}
          <div className="flex-[4] lg:flex-[3] w-full lg:w-auto lg:min-w-[300px] overflow-hidden">
            <POSCart
              cart={cart}
              onIncrease={increase}
              onDecrease={decrease}
              onRemove={remove}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Success / Undo Overlay */}
      {lastSale && (
        <SaleSuccessOverlay
          sale={lastSale}
          onClose={() => setLastSale(null)}
          onUndoComplete={handleUndoComplete}
        />
      )}
    </div>
  );
}
