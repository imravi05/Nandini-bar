import React, { useState, useEffect } from "react";
import DataTable from "../components/Table/DataTable";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/queries/useProducts";
import toast from "react-hot-toast";
import { Plus, X, Search } from "lucide-react";
import SearchableDropdown from "../components/Form/SearchableDropdown";
import productData from "../../data.json";
import authService from "../services/auth.service";
import { LayoutGrid } from 'lucide-react';
import { canPerformAction, ROLES } from "../config/roles";
import AuditPagination from "../components/AuditLogs/AuditPagination";

// Derive unique, sorted lists from dat.json
const PREDEFINED_PRODUCT_NAMES = [
  ...new Set(productData.map((item) => item.product_name)),
].sort();
const PREDEFINED_CATEGORIES = [
  ...new Set(productData.map((item) => item.category)),
].sort();

export default function Products() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: productsData, isLoading, isError, error } = useProducts({
    page,
    limit: 10,
    search: searchQuery,
    category: categoryFilter
  });

  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const pagination = productsData?.pagination ?? {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  };

  useEffect(() => {
    if (isError) {
      console.error("Products Fetch Error:", error);
      const serverMsg = error.response?.data?.message || "Failed to load products";
      toast.error(serverMsg);
    }
  }, [isError, error]);
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const handlePageChange = (p) => setPage(p);

  // Set page back to 1 when searching or filtering
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const user = authService.getCurrentUser();
  const userRole = user?.role || ROLES.CASHIER;
  const canDeleteProduct = canPerformAction(userRole, "DELETE_PRODUCT");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    unitSize: "",
    barcode: "",
    basePrice: "",
  });

  // Table Columns Setup based on Backend Schema
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (p) => <span className="font-semibold">{p.name}</span>,
    },
    {
      header: "Brand",
      accessor: "brand",
      render: (p) => <span className="text-slate-500">{p.brand || "—"}</span>,
    },
    {
      header: "Category",
      accessor: "category",
      render: (p) => (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
          style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
        >
          {p.category}
        </span>
      ),
    },
    { header: "Unit Size", accessor: "unitSize" },
    {
      header: "Barcode",
      accessor: "barcode",
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">
          {p.barcode || "—"}
        </span>
      ),
    },
    {
      header: "Price",
      accessor: "basePrice",
      render: (p) => (
        <span className="font-bold text-green-600">
          ₹{p.basePrice.toFixed(2)}
        </span>
      ),
    },
  ];

  /* ---------------- OPEN MODAL HANDLERS ---------------- */
  const handleAddProduct = () => {
    setFormData({
      name: "",
      brand: "",
      category: "",
      unitSize: "",
      barcode: "",
      basePrice: "",
    });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      brand: product.brand || "",
      category: product.category,
      unitSize: product.unitSize,
      barcode: product.barcode || "",
      basePrice: product.basePrice,
    });
    setIsEditing(true);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  /* ---------------- AUTO-FILL PREDEFINED DATA ---------------- */
  const handleProductNameChange = (selectedName) => {
    // If user types/selects something, update the name
    setFormData((prev) => ({ ...prev, name: selectedName }));

    // Find if the selected name exists in our predefined data.json
    const foundProduct = productData.find(
      (item) => item.product_name.toLowerCase() === selectedName.toLowerCase(),
    );

    // If perfectly matched, auto-fill category and unit_size to save time!
    if (foundProduct) {
      setFormData((prev) => ({
        ...prev,
        name: foundProduct.product_name,
        category: foundProduct.category,
        unitSize: foundProduct.unit_size,
      }));
    }
  };

  /* ---------------- DELETE PRODUCT ---------------- */
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`))
      return;

    deleteProductMutation.mutate(product.id, {
      onSuccess: () => {
        toast.success("Product deleted successfully");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to delete product");
      }
    });
  };

  /* ---------------- SUBMIT FORM ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parse numeric fields for prisma
    const payload = {
      ...formData,
      basePrice: parseFloat(formData.basePrice) || 0,
      brand: formData.brand || null,
      barcode: formData.barcode || null,
    };

    if (isEditing) {
      updateProductMutation.mutate({ id: editingId, productData: payload }, {
        onSuccess: () => {
          toast.success("Product updated successfully");
          setIsModalOpen(false);
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Action failed");
          console.error(error);
        }
      });
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Product created successfully");
          setIsModalOpen(false);
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Action failed");
          console.error(error);
        }
      });
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: "#e6f9fa", color: "#00ADB5" }}
          >
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-slate-800">
              Products
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage global product catalog and pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="py-2.5 pl-3 pr-8 rounded-xl border border-gray-200 text-sm text-slate-600 outline-none transition bg-white shrink-0 focus-brand"
          >
            <option value="">All Categories</option>
            {PREDEFINED_CATEGORIES.map((cat) => (
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
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition focus-brand"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleAddProduct}
            className="btn-brand font-medium py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-4">
        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          onEdit={handleEditProduct}
          onDelete={canDeleteProduct ? handleDeleteProduct : undefined}
        />

        <AuditPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 p-6 border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? "Edit Product" : "Create New Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto space-y-4 pr-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative z-50">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <SearchableDropdown
                    options={PREDEFINED_PRODUCT_NAMES}
                    value={formData.name}
                    onChange={handleProductNameChange}
                    placeholder="Search or type product name..."
                    required={true}
                  />
                </div>

                <div className="relative z-40">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <SearchableDropdown
                    options={PREDEFINED_CATEGORIES}
                    value={formData.category}
                    onChange={(val) =>
                      setFormData({ ...formData, category: val })
                    }
                    placeholder="Search category..."
                    required={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none transition focus-brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Unit Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unitSize}
                    onChange={(e) =>
                      setFormData({ ...formData, unitSize: e.target.value })
                    }
                    placeholder="e.g. 650ml, Peg"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none transition focus-brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none transition focus-brand"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder="Scan or type barcode (Optional)"
                    className="w-full px-4 py-2.5 font-mono rounded-xl border border-gray-200 outline-none transition focus-brand"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl btn-brand font-medium shadow-md transition"
                >
                  {isEditing ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
