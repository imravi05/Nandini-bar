import React, { memo } from "react";
import {
  ShoppingCart,
  Package,
  Warehouse,
  User,
  CalendarCheck,
  Settings,
  AlertCircle,
  PlusCircle,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { getReadableRef } from "./AuditDiffDrawer";

/* ── Entity config ──────────────────────────────────── */
const ENTITY_CONFIG = {
  Sale: { icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50" },
  Product: { icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
  Inventory: { icon: Warehouse, color: "text-teal-600", bg: "bg-teal-50" },
  User: { icon: User, color: "text-blue-600", bg: "bg-blue-50" },
  DailyClosing: {
    icon: CalendarCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  DEFAULT: { icon: Settings, color: "text-slate-500", bg: "bg-slate-100" },
};

/* ── Action config ──────────────────────────────────── */
const ACTION_CONFIG = {
  CREATE: {
    icon: PlusCircle,
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-400",
  },
  UPDATE: {
    icon: Pencil,
    badge: "bg-blue-100  text-blue-700",
    dot: "bg-blue-400",
  },
  DELETE: {
    icon: Trash2,
    badge: "bg-red-100   text-red-700",
    dot: "bg-red-400",
  },
  VOID: {
    icon: RotateCcw,
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-400",
  },
  DEFAULT: {
    icon: AlertCircle,
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
};

const getEntityCfg = (type) => ENTITY_CONFIG[type] ?? ENTITY_CONFIG.DEFAULT;
const getActionCfg = (action) => {
  const key = Object.keys(ACTION_CONFIG).find((k) =>
    action?.toUpperCase().includes(k),
  );
  return ACTION_CONFIG[key] ?? ACTION_CONFIG.DEFAULT;
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ── Card ─────────────────────────────────────────────── */
const AuditLogCard = memo(({ log, onClick, isFirst, isLast }) => {
  const eCfg = getEntityCfg(log.entityType);
  const aCfg = getActionCfg(log.action);
  const EntityIcon = eCfg.icon;
  const ActionIcon = aCfg.icon;

  const readableRef = getReadableRef(log);

  return (
    <div className="flex gap-4 group">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-white ${aCfg.dot}`}
        />
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
      </div>

      {/* Card body */}
      <div
        onClick={() => onClick(log)}
        className="mb-4 flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer p-4 group-hover:-translate-y-0.5 duration-150"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: icon + info */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${eCfg.bg} shrink-0`}>
              <EntityIcon size={16} className={eCfg.color} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${aCfg.badge}`}
                >
                  {log.action.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {log.entityType}
                </span>
              </div>
              <p className="text-[13px] font-bold text-slate-700 mt-1">
                {readableRef}
              </p>
            </div>
          </div>

          {/* Right: timestamp */}
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-slate-700">
              {formatTime(log.createdAt)}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(log.createdAt)}
            </p>
          </div>
        </div>

        {/* Peek into data if available */}
        {(log.oldData || log.newData) && (
          <p className="mt-2 text-xs text-indigo-500 font-medium flex items-center gap-1">
            <ActionIcon size={11} />
            Click to view changes
          </p>
        )}
      </div>
    </div>
  );
});

AuditLogCard.displayName = "AuditLogCard";
export default AuditLogCard;
