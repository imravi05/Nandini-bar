import React, { useState, useEffect, useCallback } from "react";
import { CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";

import dailyClosingService from "../../services/dailyClosing.service";
import { useCloseDay, useReopenDay, useCompositeDailyReport } from "../../hooks/queries/useDailyClosing";
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

  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // React Query mutations
  const closeDayMutation = useCloseDay();
  const reopenDayMutation = useReopenDay();

  // Use the composite hook for seamless report data (handles official vs live)
  const { 
    data: compositeData, 
    isLoading, 
    isFetching, 
    isError, 
    error 
  } = useCompositeDailyReport(today);

  // Derive final report/status from hook data
  const report = compositeData?.report || null;
  const status = compositeData?.status || 'OPEN';
  const summaries = report?.summaries || [];

  useEffect(() => {
    if (isError) {
      console.error("Daily Report Fetch Error:", error);
      const serverMsg = error.response?.data?.message || "Failed to load report";
      toast.error(serverMsg);
    }
  }, [isError, error]);

  /* ─── Close Day ─── */
  const handleCloseDay = () => {
    setIsClosing(true);
    closeDayMutation.mutate(undefined, {
      onSuccess: () => {
        setShowConfirm(false);
        toast.success(
          "Day closed successfully! Excel report is being generated.",
        );
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to close day.");
      },
      onSettled: () => {
        setIsClosing(false);
      }
    });
  };

  /* ─── Reopen Day (admin) ─── */
  const handleReopenDay = () => {
    reopenDayMutation.mutate(today, {
      onSuccess: () => {
        toast.success("Day reopened. Sales can now be recorded again.");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to reopen day.");
      }
    });
  };


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
        <div className="flex-1 flex flex-col gap-4 overflow-hidden px-4 pb-4 relative">
          {isFetching && (
            <div
              className="absolute top-0 right-4 z-20 px-3 py-1 bg-white/90 backdrop-blur-sm border shadow-sm rounded-full text-[10px] animate-pulse"
              style={{ color: "#00ADB5", borderColor: "#e6f9fa" }}
            >
              Syncing report...
            </div>
          )}
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
