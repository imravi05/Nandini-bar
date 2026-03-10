import React, { memo } from "react";
import { Lock, Unlock, AlertTriangle, Download } from "lucide-react";

const STATUS_CONFIG = {
  OPEN: {
    label: "OPEN",
    dot: "bg-green-400",
    text: "text-green-700",
    bg: "bg-green-50",
  },
  CLOSED: {
    label: "CLOSED",
    dot: "",
    text: "text-white",
    bg: "",
    dotStyle: { backgroundColor: "#FF5722" },
    bgStyle: { backgroundColor: "#FF57221A" },
  },
  REOPENED: {
    label: "REOPENED",
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
};

const ClosingActionBar = memo(
  ({ status, onCloseDay, onReopenDay, onDownload, isAdmin }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Status badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg}`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${cfg.dot}`} />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}
          >
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Warning note */}
          {status === "OPEN" && (
            <p className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
              <AlertTriangle size={12} className="text-amber-400" />
              Closing locks all of today's sales
            </p>
          )}

          {/* Reopen (admin only, shown when CLOSED) */}
          {status === "CLOSED" && isAdmin && (
            <button
              onClick={onReopenDay}
              className="text-xs font-semibold text-slate-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Unlock size={13} />
              Reopen Day
            </button>
          )}

          {/* Main action */}
          {status !== "CLOSED" ? (
            <button
              onClick={onCloseDay}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md shadow-red-200 transition active:scale-95"
            >
              <Lock size={15} />
              Close Day
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onDownload}
                className="text-xs font-semibold border px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                style={{ color: "#00ADB5", borderColor: "#00ADB5" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e6f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                <Download size={13} />
                Download Excel
              </button>
              <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <Lock size={14} className="text-red-400" />
                Day Closed — No further sales allowed
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ClosingActionBar.displayName = "ClosingActionBar";
export default ClosingActionBar;
