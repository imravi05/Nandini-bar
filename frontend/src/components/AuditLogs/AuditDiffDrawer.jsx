import React, { memo } from "react";
import { X, ArrowRight } from "lucide-react";

/* ── Formatter Helpers ───────────────────────────────── */
const IGNORED_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "isSynced",
  "revisionNumber",
  "password",
  "dailyClosingId",
]);

const KEY_LABELS = {
  saleNumber: "Receipt No.",
  totalAmount: "Total Amount (₹)",
  saleDate: "Date",
  status: "Status",
  quantity: "Quantity",
  basePrice: "Base Price (₹)",
  name: "Name",
  category: "Category",
  brand: "Brand",
  unitSize: "Unit Size",
  costPrice: "Cost Price (₹)",
  openingStock: "Opening Stock",
  closingStock: "Closing Stock",
  soldQuantity: "Sold Qty",
  items: "Items in Sale",
};

const formatValue = (key, val) => {
  if (val === null || val === undefined) return "—";
  if (key === "items" && Array.isArray(val)) return `${val.length} item(s)`;

  if (
    typeof val === "string" &&
    val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  ) {
    return new Date(val).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (typeof val === "object") {
    if (val.name) return val.name; // Smart extract of nested objects
    return JSON.stringify(val);
  }
  return String(val);
};

export const getReadableRef = (log) => {
  const data = log.newData || log.oldData || {};
  if (log.entityType === "Sale" && data.saleNumber)
    return `Receipt ${data.saleNumber}`;
  if (log.entityType === "Product" && data.name)
    return `${data.name} (${data.category})`;
  if (log.entityType === "Inventory" && data.product?.name)
    return `${data.product.name} Stock`;
  if (log.entityType === "DailyClosing" && data.date) {
    return `Closing for ${new Date(data.date).toLocaleDateString("en-IN")}`;
  }

  if (log.entityId && typeof log.entityId === "string") {
    return `Ref: ${log.entityId.substring(0, 8).toUpperCase()}`;
  }
  return "Ref: Unknown";
};

/* Pretty-diff two JSON objects side-by-side */
const DiffSection = ({ label, data, color, bgColor }) => {
  if (!data) return null;
  const entries = Object.entries(data).filter(
    ([k]) => !IGNORED_KEYS.has(k) && !k.endsWith("Id"),
  );

  return (
    <div className={`rounded-xl ${bgColor} p-4 flex-1`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${color}`}>
        {label}
      </p>
      <div className="space-y-4">
        {entries.map(([key, val]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {KEY_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="text-sm text-slate-800 font-semibold break-words">
              {formatValue(key, val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AuditDiffDrawer = memo(({ log, onClose }) => {
  if (!log) return null;

  const hasData = log.oldData || log.newData;
  const readableRef = getReadableRef(log);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Log Detail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {readableRef}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-4 border-b border-gray-50 bg-slate-50 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Module
            </p>
            <p className="font-bold text-slate-700 mt-0.5">{log.entityType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Action
            </p>
            <p className="font-bold text-slate-700 mt-0.5">
              {log.action.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Time
            </p>
            <p className="font-bold text-slate-700 mt-0.5">
              {new Date(log.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Diff view */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {hasData ? (
            <>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Before → After
              </p>
              <div className="flex gap-3 items-start">
                <DiffSection
                  label="Before"
                  data={log.oldData}
                  color="text-red-600"
                  bgColor="bg-red-50"
                />
                {log.oldData && log.newData && (
                  <ArrowRight
                    size={16}
                    className="text-slate-300 mt-6 shrink-0"
                  />
                )}
                <DiffSection
                  label="After"
                  data={log.newData}
                  color="text-green-600"
                  bgColor="bg-green-50"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-2">
              <p className="text-sm">No data snapshot available</p>
              <p className="text-xs">
                This log action had no recorded changes.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

AuditDiffDrawer.displayName = "AuditDiffDrawer";
export default AuditDiffDrawer;
