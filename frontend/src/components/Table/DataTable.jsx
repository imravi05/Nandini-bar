import React from "react";
import { Edit, Trash2 } from "lucide-react";

const DataTable = ({ columns, data, onEdit, onDelete, isLoading }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
      {/* Sticky header + scrollable body wrapper */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          {/* Sticky column headers */}
          <thead
            className="sticky top-0 z-10"
            style={{ backgroundColor: "#393E46" }}
          >
            <tr className="border-b border-white/10 text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 whitespace-nowrap">
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
                  className="px-6 py-16 text-center text-slate-400"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: "#00ADB5",
                        borderTopColor: "transparent",
                      }}
                    />
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="transition-colors group"
                  style={{ cursor: "default" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0fafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "")
                  }
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-slate-700">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: "#00ADB5" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e0f7f8")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "")
                            }
                            title="Edit"
                          >
                            <Edit size={20} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => !row._isDeleteDisabled && onDelete(row)}
                            disabled={row._isDeleteDisabled}
                            className={`p-1.5 rounded-md transition-all duration-200 ${
                              row._isDeleteDisabled 
                                ? "text-slate-200 cursor-not-allowed opacity-50" 
                                : "text-red-500 hover:bg-red-50 cursor-pointer shadow-sm"
                            }`}
                            title={row._isDeleteDisabled ? "Cannot delete product with active stock/history" : "Delete"}
                          >
                            <Trash2 size={20} />
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
                  className="px-6 py-16 text-center text-slate-400"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-slate-50/50 text-xs text-slate-400 shrink-0">
        {data?.length || 0} records total
      </div>
    </div>
  );
};

export default DataTable;
