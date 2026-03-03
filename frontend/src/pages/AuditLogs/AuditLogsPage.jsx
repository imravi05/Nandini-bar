import React, { useState, useEffect, useCallback, useRef } from "react";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";

import auditService from "../../services/audit.service";
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
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeLog, setActiveLog] = useState(null); // log shown in drawer

  // Debounce ref — prevent a fetch on every keystroke for ID field
  const debounceRef = useRef(null);

  const fetchLogs = useCallback(async (params) => {
    setIsLoading(true);
    try {
      // Build clean query — omit empty strings
      const query = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null),
      );
      const res = await auditService.getLogs(query);
      setLogs(res.data ?? []);
      setPagination(
        res.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 },
      );
    } catch {
      toast.error("Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced fetch whenever filters change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLogs(filters);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchLogs]);

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
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
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
          <span className="ml-auto text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full">
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
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Loading logs…
          </div>
        ) : (
          <AuditTimeline logs={logs} onCardClick={setActiveLog} />
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
