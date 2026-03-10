import React, { useState, useEffect, useCallback } from "react";
import { CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";

import dailyClosingService from "../../services/dailyClosing.service";
import authService from "../../services/auth.service";
import { canPerformAction, ROLES } from "../../config/roles";

import ClosingStatCards from "../../components/DailyClosing/ClosingStatCards";
import ClosingProductTable from "../../components/DailyClosing/ClosingProductTable";
import ClosingActionBar from "../../components/DailyClosing/ClosingActionBar";
import ClosingConfirmModal from "../../components/DailyClosing/ClosingConfirmModal";

// Helpers
const toLocalDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const formatDateLabel = (d = new Date()) =>
  d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function DailyClosingPage() {
  const today = toLocalDateStr();
  const dateLabel = formatDateLabel();
  const user = authService.getCurrentUser();
  const userRole = user?.role || ROLES.CASHIER;
  const canReopen = canPerformAction(userRole, "REOPEN_DAY");

  const [report, setReport] = useState(null); // DailyClosing | null
  const [status, setStatus] = useState("OPEN"); // OPEN | CLOSED | REOPENED
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  /* ─── Shared: compute a live report from today's raw sales ─── */
  const fetchLiveSales = useCallback(async () => {
    const sales = await dailyClosingService.getTodaySales(today);
    let totalSalesAmount = 0;
    let totalSalesQuantity = 0;
    const productMap = {};

    for (const sale of sales) {
      totalSalesAmount += sale.totalAmount ?? 0;
      for (const item of sale.items ?? []) {
        totalSalesQuantity += item.quantity;
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            id: item.productId,
            product: item.product,
            openingStock: null,
            receivedStock: 0,
            totalStock: null,
            soldQuantity: 0,
            saleAmount: 0,
            closingStock: null,
            closingValue: null,
          };
        }
        productMap[item.productId].soldQuantity += item.quantity;
        productMap[item.productId].saleAmount += item.totalPrice ?? 0;
      }
    }

    return {
      totalSalesAmount,
      totalSalesQuantity,
      totalClosingValue: 0,
      summaries: Object.values(productMap),
    };
  }, [today]);

  /* ─── Fetch today's closing report ─── */
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dailyClosingService.getReport(today);
      if (data && data.id) {
        if (data.status === "CLOSED") {
          // Official closed data — show the snapshot as-is
          setReport(data);
          setStatus("CLOSED");
        } else {
          // REOPENED — day is active again, show live sales (not the stale snapshot)
          const liveReport = await fetchLiveSales();
          setReport(liveReport);
          setStatus("REOPENED");
        }
      } else {
        setReport(null);
        setStatus("OPEN");
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        // OPEN — no DailyClosing record yet, fetch live sales
        try {
          const liveReport = await fetchLiveSales();
          setReport(liveReport);
        } catch {
          setReport(null);
        }
        setStatus("OPEN");
      } else {
        toast.error("Failed to load today's report.");
        setReport(null);
        setStatus("OPEN");
      }
    } finally {
      setIsLoading(false);
    }
  }, [today, fetchLiveSales]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  /* ─── Close Day ─── */
  const handleCloseDay = async () => {
    setIsClosing(true);
    try {
      const result = await dailyClosingService.closeDay();
      setReport(result);
      setStatus("CLOSED");
      setShowConfirm(false);
      toast.success(
        "Day closed successfully! Excel report is being generated.",
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to close day.");
    } finally {
      setIsClosing(false);
    }
  };

  /* ─── Reopen Day (admin) ─── */
  const handleReopenDay = async () => {
    try {
      await dailyClosingService.reopenDay(today);
      setStatus("REOPENED");
      toast.success("Day reopened. Sales can now be recorded again.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reopen day.");
    }
  };

  const summaries = report?.summaries ?? [];

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center gap-3 bg-white px-6 py-4 border-b border-gray-100 shrink-0">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
        >
          <CalendarCheck size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">
            Daily Closing
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{dateLabel}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#00ADB5", borderTopColor: "transparent" }}
          />
          Loading today's report...
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden px-4 pb-4">
          {/* Stat cards */}
          <ClosingStatCards report={report} isOpen={status === "OPEN"} />

          {/* Product breakdown table — takes remaining space */}
          <div className="flex-1 overflow-hidden">
            <ClosingProductTable summaries={summaries} />
          </div>

          {/* Action bar — always visible at bottom */}
          <ClosingActionBar
            status={status}
            isAdmin={canReopen}
            onCloseDay={() => setShowConfirm(true)}
            onReopenDay={handleReopenDay}
            onDownload={() => dailyClosingService.downloadReport(today)}
          />
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <ClosingConfirmModal
          dateLabel={dateLabel}
          totalSales={report?.totalSalesAmount ?? 0}
          totalQty={report?.totalSalesQuantity ?? 0}
          onConfirm={handleCloseDay}
          onCancel={() => setShowConfirm(false)}
          isLoading={isClosing}
        />
      )}
    </div>
  );
}
