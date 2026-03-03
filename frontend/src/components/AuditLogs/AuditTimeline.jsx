import React, { memo } from "react";
import AuditLogCard from "./AuditLogCard";
import { ClipboardList } from "lucide-react";

const AuditTimeline = memo(({ logs, onCardClick }) => {
  if (logs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-20">
        <ClipboardList size={40} className="opacity-30" />
        <p className="text-sm font-medium">No audit logs found.</p>
        <p className="text-xs text-slate-300">
          Try a different filter or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-1 pb-4">
      {logs.map((log, i) => (
        <AuditLogCard
          key={log.id}
          log={log}
          onClick={onCardClick}
          isFirst={i === 0}
          isLast={i === logs.length - 1}
        />
      ))}
    </div>
  );
});

AuditTimeline.displayName = "AuditTimeline";
export default AuditTimeline;
