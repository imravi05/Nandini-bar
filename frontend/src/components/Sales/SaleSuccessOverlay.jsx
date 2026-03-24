import React, { useState } from "react";
import { CheckCircle, RotateCcw, X, Package } from "lucide-react";
import { useDeleteSale } from "../../hooks/queries/useSales";
import toast from "react-hot-toast";

import authService from "../../services/auth.service";
import { canPerformAction, ROLES } from "../../config/roles";

const SaleSuccessOverlay = ({ sale, onClose, onUndoComplete }) => {
  const user = authService.getCurrentUser();
  const userRole = user?.role || ROLES.CASHIER;
  const canVoid = canPerformAction(userRole, "VOID_SALE");
  const [isUndoing, setIsUndoing] = useState(false);
  const deleteSaleMutation = useDeleteSale();

  const handleUndo = () => {
    setIsUndoing(true);
    deleteSaleMutation.mutate(sale.id, {
      onSuccess: () => {
        toast.success("Sale reversed. Stock restored.");
        onUndoComplete(); // tells parent to refresh inventory
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Could not undo sale.");
      },
      onSettled: () => {
        setIsUndoing(false);
      }
    });
  };

  return (
    /* Backdrop — click outside to dismiss */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close when clicking card
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${sale.isParcel ? 'bg-orange-100' : 'bg-green-100'}`}>
            {sale.isParcel ? (
              <Package size={36} className="text-orange-500" />
            ) : (
              <CheckCircle size={36} className="text-green-500" />
            )}
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-slate-800 mb-1 flex items-center justify-center gap-2">
          {sale.isParcel ? "Parcel Complete!" : "Sale Complete!"}
          {sale.isParcel && (
            <span className="text-[10px] bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
              Parcel
            </span>
          )}
        </h2>
        <p className="text-sm text-slate-500 mb-1">{sale.saleNumber}</p>
        <p
          className="text-3xl font-extrabold mb-6"
          style={{ color: "#00ADB5" }}
        >
          ₹{sale.totalAmount?.toFixed(0)}
        </p>

        {canVoid && (
          <button
            onClick={handleUndo}
            disabled={isUndoing}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 flex items-center justify-center gap-2 transition disabled:opacity-40 mt-6"
          >
            {isUndoing ? (
              <>
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                Reversing sale...
              </>
            ) : (
              <>
                <RotateCcw size={15} />
                Undo Sale (Customer Cancelled)
              </>
            )}
          </button>
        )}

        <p className="text-[10px] text-slate-400 mt-3">
          Tap anywhere outside to dismiss and start next order
        </p>
      </div>
    </div>
  );
};

export default SaleSuccessOverlay;
