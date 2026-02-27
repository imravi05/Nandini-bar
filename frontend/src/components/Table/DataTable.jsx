import React from "react";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";

const DataTable = ({ columns, data, onEdit, onDelete, isLoading }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-slate-700">
                      {/* Allow custom render function per column, else display raw value */}
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Basic Pagination Header (Can be expanded if backend supports paginated meta) */}
      <div className="px-6 py-4 border-t border-gray-100 text-sm text-slate-500 flex justify-between items-center bg-slate-50/50">
        <p>
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {data?.length || 0}
          </span>{" "}
          records
        </p>
        <div className="flex gap-1">
          <button
            className="p-1 border border-gray-200 rounded-md bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-50"
            disabled
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="p-1 border border-gray-200 rounded-md bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-50"
            disabled
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
