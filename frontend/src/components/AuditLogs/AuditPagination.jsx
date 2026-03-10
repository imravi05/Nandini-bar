import React, { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AuditPagination = memo(({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-3 shrink-0 border-t border-gray-100">
      <p className="text-xs text-slate-400">
        Showing{" "}
        <span className="font-semibold text-slate-600">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold text-slate-600">{total}</span> logs
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-xl border border-gray-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} className="text-slate-600" />
        </button>

        {/* Page pills */}
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                p === page
                  ? "text-white shadow-md"
                  : "border border-gray-200 text-slate-600 hover:bg-slate-50"
              }`}
              style={p === page ? { backgroundColor: "#00ADB5" } : {}}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-xl border border-gray-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={14} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
});

AuditPagination.displayName = "AuditPagination";
export default AuditPagination;
