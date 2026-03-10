import React, { memo } from "react";
import { TrendingUp, Package, IndianRupee } from "lucide-react";

const StatCard = memo(({ icon: Icon, label, value, sub, color, style }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4`}
  >
    <div className={`p-3 rounded-xl ${color}`} style={style}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
));

StatCard.displayName = "StatCard";

const ClosingStatCards = memo(({ report, isOpen }) => {
  const totalSales = report?.totalSalesAmount ?? 0;
  const totalQty = report?.totalSalesQuantity ?? 0;
  const closingValue = report?.totalClosingValue ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        icon={IndianRupee}
        label="Total Sales"
        value={`₹${totalSales.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        sub={isOpen ? "today so far" : "final for the day"}
        color="bg-green-50 text-green-600"
      />
      <StatCard
        icon={TrendingUp}
        label="Items Sold"
        value={totalQty.toLocaleString("en-IN")}
        sub="total units"
        color=""
        style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
      />
      <StatCard
        icon={Package}
        label="Closing Stock Value"
        value={`₹${closingValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        sub="remaining inventory"
        color="bg-amber-50 text-amber-600"
      />
    </div>
  );
});

ClosingStatCards.displayName = "ClosingStatCards";
export default ClosingStatCards;
