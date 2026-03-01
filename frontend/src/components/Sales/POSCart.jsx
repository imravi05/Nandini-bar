import React from "react";
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle } from "lucide-react";

const POSCart = ({
  cart,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  isSubmitting,
}) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = cart.length === 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cart Header */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag size={18} className="text-indigo-500" />
          Current Order
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isEmpty
            ? "No items yet"
            : `${cart.reduce((s, i) => s + i.quantity, 0)} item(s)`}
        </p>
      </div>

      {/* Cart Items — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-12 gap-3">
            <ShoppingBag size={40} strokeWidth={1.2} />
            <p className="text-sm">Tap a drink to add it</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5"
            >
              {/* Item info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {item.unitSize} · ₹{item.price}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onDecrease(item.productId)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200 text-slate-600 hover:border-red-300 hover:text-red-500 transition"
                >
                  <Minus size={11} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-700">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onIncrease(item.productId)}
                  disabled={item.quantity >= item.stock}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={11} />
                </button>
              </div>

              {/* Row total */}
              <p className="text-xs font-bold text-slate-800 w-14 text-right shrink-0">
                ₹{(item.price * item.quantity).toFixed(0)}
              </p>

              {/* Remove */}
              <button
                onClick={() => onRemove(item.productId)}
                className="text-slate-300 hover:text-red-500 transition shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer — sticky total + checkout */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 shrink-0 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-500">Total</span>
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{total.toFixed(0)}
          </span>
        </div>

        <button
          disabled={isEmpty || isSubmitting}
          onClick={onCheckout}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={17} />
              Complete Sale
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default POSCart;
