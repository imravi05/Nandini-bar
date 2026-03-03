import React, { memo } from "react";
import { Search, Filter, X } from "lucide-react";

const ENTITY_TYPES = [
  { value: "", label: "All Modules" },
  { value: "Product", label: "Products" },
  { value: "Sale", label: "Sales" },
  { value: "Inventory", label: "Inventory" },
  { value: "DailyClosing", label: "Daily Closing" },
];

const AuditFilterBar = memo(({ filters, onChange, onClear }) => {
  const handleChange = (key, value) =>
    onChange({ ...filters, [key]: value, page: 1 });

  const hasActiveFilters =
    filters.entityType ||
    filters.entityId ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap items-center gap-3 shrink-0">
      {/* Module filter */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
        <Filter size={14} className="text-slate-400" />
        <select
          value={filters.entityType}
          onChange={(e) => handleChange("entityType", e.target.value)}
          className="bg-transparent text-sm text-slate-700 font-medium outline-none cursor-pointer"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Entity ID / keyword search */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex-1 min-w-[180px]">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by ID…"
          value={filters.entityId}
          onChange={(e) => handleChange("entityId", e.target.value)}
          className="bg-transparent text-sm text-slate-700 outline-none w-full placeholder:text-slate-400"
        />
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none"
        />
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
});

AuditFilterBar.displayName = "AuditFilterBar";
export default AuditFilterBar;
