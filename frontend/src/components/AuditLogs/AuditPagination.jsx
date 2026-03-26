import React, { memo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

/**
 * Premium Fixed-Slot Pagination Logic
 * Always returns exactly 7 items if totalPages > 7 to prevent UI jumping.
 */
const getPageRange = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Case 1: Near the start: [1, 2, 3, 4, 5, "...", totalPages]
  if (currentPage < 5) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // Case 2: Near the end: [1, "...", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
  if (currentPage > totalPages - 4) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Case 3: Middle: [1, "...", page-1, page, page+1, "...", totalPages]
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

const AuditPagination = memo(({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = getPageRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4 bg-white/50 backdrop-blur-sm border-t border-gray-100/80 rounded-b-2xl shrink-0">
      {/* Summary Info */}
      <div className="order-2 sm:order-1">
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-700">{from}</span>–<span className="font-bold text-slate-700">{to}</span> of{" "}
          <span className="font-bold text-slate-700">{total}</span> logs
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="group flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#00ADB5] hover:bg-[#e6f9fa] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-white transition-all duration-200 shadow-sm disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} className="text-slate-600 group-hover:text-[#00ADB5] transition-colors" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <div key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-300">
                  <MoreHorizontal size={14} />
                </div>
              );
            }

            const isActive = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`
                  w-9 h-9 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? "bg-[#00ADB5] text-white shadow-lg shadow-[#00ADB5]/30 scale-105" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }
                `}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="group flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#00ADB5] hover:bg-[#e6f9fa] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:bg-white transition-all duration-200 shadow-sm disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} className="text-slate-600 group-hover:text-[#00ADB5] transition-colors" />
        </button>
      </div>
    </div>
  );
});

AuditPagination.displayName = "AuditPagination";
export default AuditPagination;

