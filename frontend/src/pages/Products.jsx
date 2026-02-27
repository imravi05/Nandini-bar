import React, { useState, useEffect } from "react";
import DataTable from "../components/Table/DataTable";
import productService from "../services/product.service";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase">
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

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productService.getProducts();
      // Ensure we hit the right generic array based on your backend formatting
      setProducts(res.data || res.products || res || []);
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  /* ---------------- DELETE PRODUCT ---------------- */
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`))
      return;

    try {
      await productService.deleteProduct(product.id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
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

    try {
      if (isEditing) {
        await productService.updateProduct(editingId, payload);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(payload);
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
      console.error(error);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800">
            Master Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage global product catalog and pricing
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
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
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Kingfisher Premium"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g. Beer, Whisky"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
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
                    className="w-full px-4 py-2.5 font-mono rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
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
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 transition"
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
