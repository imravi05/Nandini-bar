import React, { memo, useState } from "react";
import { AlertTriangle, X, Lock } from "lucide-react";

const ClosingConfirmModal = memo(
  ({ totalSales, totalQty, dateLabel, onConfirm, onCancel, isLoading }) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={30} className="text-red-500" />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-slate-800 text-center mb-1">
          Close Day?
        </h2>
        <p className="text-sm text-slate-500 text-center mb-5">
          You are closing{" "}
          <span className="font-semibold text-slate-700">{dateLabel}</span>.
          After this, no new sales can be recorded for today.
        </p>

        {/* Summary strip */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between text-sm mb-6">
          <span className="text-slate-500">Total Sales</span>
          <span className="font-extrabold text-slate-800">
            ₹{totalSales.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between text-sm mb-6 -mt-3">
          <span className="text-slate-500">Items Sold</span>
          <span className="font-extrabold text-slate-800">
            {totalQty} units
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-200 transition active:scale-95 disabled:opacity-40"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={14} />
                Yes, Close Day
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ),
);

ClosingConfirmModal.displayName = "ClosingConfirmModal";
export default ClosingConfirmModal;
