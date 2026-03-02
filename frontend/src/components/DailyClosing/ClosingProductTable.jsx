import React, { memo, useMemo } from "react";

// Null means data not available yet (live preview) — show dash
const fmt = (v) => (v === null || v === undefined ? "—" : v);

const Row = memo(({ s }) => (
  <tr className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors text-sm">
    <td className="px-5 py-3 font-semibold text-slate-800">
      {s.product?.name ?? "—"}
    </td>
    <td className="px-5 py-3 text-center text-slate-400">
      {fmt(s.openingStock)}
    </td>
    <td className="px-5 py-3 text-center text-slate-400">
      {fmt(s.receivedStock)}
    </td>
    <td className="px-5 py-3 text-center font-bold text-red-500">
      {s.soldQuantity}
    </td>
    <td className="px-5 py-3 text-center text-slate-400">
      {fmt(s.closingStock)}
    </td>
    <td className="px-5 py-3 text-right font-bold text-green-600">
      ₹{s.saleAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </td>
  </tr>
));

Row.displayName = "SummaryRow";

const ClosingProductTable = memo(({ summaries = [] }) => {
  // Sort: products with sales first, then by name
  const sorted = useMemo(
    () =>
      [...summaries].sort((a, b) => {
        if (b.soldQuantity !== a.soldQuantity)
          return b.soldQuantity - a.soldQuantity;
        return (a.product?.name ?? "").localeCompare(b.product?.name ?? "");
      }),
    [summaries],
  );

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-16 text-slate-400 text-sm">
        No product data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
      <div className="overflow-auto h-full">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3 text-center">Opening</th>
              <th className="px-5 py-3 text-center">Received</th>
              <th className="px-5 py-3 text-center">Sold</th>
              <th className="px-5 py-3 text-center">Closing</th>
              <th className="px-5 py-3 text-right">Sell Amount</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <Row key={s.id} s={s} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ClosingProductTable.displayName = "ClosingProductTable";
export default ClosingProductTable;
