import React from "react";
import { X } from "lucide-react";
import SearchableDropdown from "../Form/SearchableDropdown";
import productData from "../../../data.json";

const PREDEFINED_PRODUCT_NAMES = [
  ...new Set(productData.map((item) => item.product_name)),
].sort();
const PREDEFINED_CATEGORIES = [
  ...new Set(productData.map((item) => item.category)),
].sort();

export default function InventoryModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
}) {
  if (!isOpen) return null;

  /* ---------------- AUTO-FILL PREDEFINED DATA ---------------- */
  const handleProductNameChange = (selectedName) => {
    setFormData((prev) => ({ ...prev, name: selectedName }));

    const foundProduct = productData.find(
      (item) => item.product_name.toLowerCase() === selectedName.toLowerCase(),
    );

    if (foundProduct) {
      setFormData((prev) => ({
        ...prev,
        name: foundProduct.product_name,
        category: foundProduct.category,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 p-6 border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Edit Product Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
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
                placeholder="Select or type product name..."
              />
            </div>

            <div className="col-span-2 relative z-40">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <SearchableDropdown
                options={PREDEFINED_CATEGORIES}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                placeholder="Select category..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Cost Price (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none transition focus-brand"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl btn-brand font-medium shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
