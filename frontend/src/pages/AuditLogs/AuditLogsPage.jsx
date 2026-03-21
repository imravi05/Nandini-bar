import React, { useState, useCallback, useEffect } from "react";
import { Shield } from "lucide-react";

import { useAuditLogs } from "../../hooks/queries/useAudit";
import AuditFilterBar from "../../components/AuditLogs/AuditFilterBar";
import AuditTimeline from "../../components/AuditLogs/AuditTimeline";
import AuditDiffDrawer from "../../components/AuditLogs/AuditDiffDrawer";
import AuditPagination from "../../components/AuditLogs/AuditPagination";

const DEFAULT_FILTERS = {
  entityType: "",
  entityId: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 20,
};

export default function AuditLogsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeLog, setActiveLog] = useState(null); // log shown in drawer

  // Build clean query — omit empty strings
  const queryParams = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== null),
  );

  const { data, isLoading, isFetching, isError, error } = useAuditLogs(queryParams);
  const logs = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

  useEffect(() => {
    if (isError) {
      console.error("Audit Logs Fetch Error:", error);
      const serverMsg = error.response?.data?.message || "Failed to load audit logs";
      toast.error(serverMsg);
    }
  }, [isError, error]);

  const handleFilterChange = useCallback((next) => setFilters(next), []);

  const handleClearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const handlePageChange = useCallback(
    (p) => setFilters((prev) => ({ ...prev, page: p })),
    [],
  );

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center gap-3 bg-white px-6 py-4 border-b border-gray-100 shrink-0">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
        >
          <Shield size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">
            Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full trail of every system action
          </p>
        </div>
        {!isLoading && (
          <span
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
          >
            {pagination.total} total logs
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-hidden px-4">
        {/* Filters */}
        <AuditFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Timeline or loader */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#00ADB5", borderTopColor: "transparent" }}
            />
            Loading logs…
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {isFetching && (
              <div
                className="absolute top-2 right-4 z-20 px-3 py-1 bg-white/90 backdrop-blur-sm border shadow-sm rounded-full text-[10px] animate-pulse"
                style={{ color: "#00ADB5", borderColor: "#e6f9fa" }}
              >
                Syncing logs...
              </div>
            )}
            <AuditTimeline logs={logs} onCardClick={setActiveLog} />
          </div>
        )}

        {/* Pagination */}
        <AuditPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Detail drawer */}
      {activeLog && (
        <AuditDiffDrawer log={activeLog} onClose={() => setActiveLog(null)} />
      )}
    </div>
  );
}
