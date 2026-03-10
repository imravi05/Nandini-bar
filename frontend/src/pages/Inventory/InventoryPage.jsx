import React, { useState, useEffect, useRef } from "react";
import DataTable from "../../components/Table/DataTable";
import InventoryModal from "../../components/Inventory/InventoryModal";
import inventoryService from "../../services/inventory.service";
import productService from "../../services/product.service";
import toast from "react-hot-toast";
import { Package, Check, X, Pencil, Search } from "lucide-react";

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [productsMaster, setProductsMaster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal State (for editing product details only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  // Inline stock edit state
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineStockValue, setInlineStockValue] = useState("");
  const inlineInputRef = useRef(null);

  // Form State for modal (no stock field — stock is edited inline)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    costPrice: "",
    reason: "",
  });

  // Table Columns Setup
  const columns = [
    {
      header: "Product Name",
      accessor: "product.name",
      render: (inv) => (
        <span className="font-semibold">{inv.product?.name || "Unknown"}</span>
      ),
    },
    {
      header: "Category",
      accessor: "product.category",
      render: (inv) => (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
          style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
        >
          {inv.product?.category || "—"}
        </span>
      ),
    },
    {
      header: "Unit Size",
      accessor: "product.unitSize",
      render: (inv) => (
        <span className="text-slate-500 text-sm">
          {inv.product?.unitSize || "—"}
        </span>
      ),
    },
    {
      header: "Stock",
      accessor: "quantity",
      render: (inv) => {
        const isInlineEditing = inlineEditId === inv.id;

        if (isInlineEditing) {
          return (
            <div className="flex items-center gap-1">
              <input
                ref={inlineInputRef}
                type="number"
                min="0"
                value={inlineStockValue}
                onChange={(e) => setInlineStockValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInlineStockSave(inv);
                  if (e.key === "Escape") setInlineEditId(null);
                }}
                className="w-20 px-2 py-1 text-sm border rounded-lg focus:outline-none"
                style={{ borderColor: "#00ADB5" }}
              />
              <button
                onClick={() => handleInlineStockSave(inv)}
                className="p-1 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition"
                title="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setInlineEditId(null)}
                className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 group">
            <span className="font-bold text-slate-800">
              {inv.quantity}
              <span className="text-xs font-normal text-slate-400 ml-1">
                units
              </span>
            </span>
            <button
              onClick={() => {
                setInlineEditId(inv.id);
                setInlineStockValue(inv.quantity);
                setTimeout(() => inlineInputRef.current?.focus(), 50);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded transition"
              style={{ color: "#00ADB5" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e6f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
              }}
              title="Edit stock"
            >
              <Pencil size={13} />
            </button>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (inv) => {
        const qty = inv.quantity;
        if (qty <= 0)
          return (
            <span
              className="px-2 py-1 rounded-md text-xs font-semibold"
              style={{ backgroundColor: "#FF57221A", color: "#FF5722" }}
            >
              OUT OF STOCK
            </span>
          );
        if (qty <= 10)
          return (
            <span
              className="px-2 py-1 rounded-md text-xs font-semibold"
              style={{ backgroundColor: "#F8B4001A", color: "#c48a00" }}
            >
              LOW STOCK
            </span>
          );
        return (
          <span
            className="px-2 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
          >
            IN STOCK
          </span>
        );
      },
    },
  ];

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invRes, prodRes] = await Promise.all([
        inventoryService.getInventory(),
        productService.getProducts(),
      ]);

      setInventories(invRes.data || invRes.inventory || invRes || []);
      setProductsMaster(prodRes.data || prodRes.products || prodRes || []);
    } catch (error) {
      toast.error("Failed to load inventory data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- INLINE STOCK EDIT SAVE ---------------- */
  const handleInlineStockSave = async (inv) => {
    const newQty = parseInt(inlineStockValue);
    if (isNaN(newQty) || newQty < 0) {
      toast.error("Please enter a valid stock number");
      return;
    }

    const changeQty = newQty - inv.quantity;
    if (changeQty === 0) {
      setInlineEditId(null);
      return;
    }

    try {
      await inventoryService.adjustInventory(
        inv.productId,
        changeQty,
        changeQty > 0 ? "Stock top-up" : "Stock correction",
      );
      toast.success(`Stock updated to ${newQty} units`);
      setInlineEditId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    }
  };

  /* ---------------- OPEN EDIT MODAL (product details only) ---------------- */
  const handleEditStock = (inv) => {
    setFormData({
      name: inv.product?.name || "",
      category: inv.product?.category || "",
      costPrice: inv.product?.basePrice || 0,
      reason: "",
    });
    setEditingId(inv.id);
    setEditingProductId(inv.productId);
    setIsModalOpen(true);
  };

  /* ---------------- DELETE INVENTORY ---------------- */
  const handleDeleteStock = async (inv) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${inv.product?.name} from inventory? Stock must be 0 to delete.`,
      )
    )
      return;

    try {
      await inventoryService.deleteInventory(inv.id);
      toast.success("Inventory entry deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete. Stock must be 0.",
      );
    }
  };

  /* ---------------- SUBMIT FORM (product details only) ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const costPrice = parseFloat(formData.costPrice) || 0;

    if (!formData.name?.trim()) return toast.error("Product name is required");
    if (!formData.category?.trim()) return toast.error("Category is required");

    try {
      // Update product details only (stock is managed inline)
      await productService.updateProduct(editingProductId, {
        name: formData.name,
        category: formData.category,
        basePrice: costPrice,
      });
      toast.success("Product details updated successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
          >
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-slate-800">
              Shop Inventory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live stock levels across all categories
            </p>
          </div>
        </div>

        {/* Search + Filter row */}
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2.5 pl-3 pr-8 rounded-xl border border-gray-200 text-sm text-slate-600 outline-none transition bg-white shrink-0 focus-brand"
          >
            <option value="">All Categories</option>
            {[
              ...new Set(
                inventories.map((inv) => inv.product?.category).filter(Boolean),
              ),
            ]
              .sort()
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition focus-brand"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          data={inventories.filter((inv) => {
            const matchSearch =
              inv.product?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              inv.product?.category
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchCategory = categoryFilter
              ? inv.product?.category === categoryFilter
              : true;
            return matchSearch && matchCategory;
          })}
          isLoading={isLoading}
          onEdit={handleEditStock}
          // onDelete={handleDeleteStock}
        />
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}
