import React, { useState, useEffect } from "react";
import DataTable from "../../components/Table/DataTable";
import InventoryModal from "../../components/Inventory/InventoryModal";
import inventoryService from "../../services/inventory.service";
import productService from "../../services/product.service";
import toast from "react-hot-toast";
import { Plus, Package } from "lucide-react";

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [productsMaster, setProductsMaster] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // Inventory ID
  const [editingProductId, setEditingProductId] = useState(null); // Product ID

  // Form State extracted to InventoryModal
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    sellingPrice: "",
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
        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase">
          {inv.product?.category || "—"}
        </span>
      ),
    },
    {
      header: "Stock Level",
      accessor: "quantity",
      render: (inv) => (
        <span className="font-bold text-slate-800">
          {inv.quantity}{" "}
          <span className="text-xs font-normal text-slate-400 ml-1">units</span>
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (inv) => {
        const qty = inv.quantity;
        if (qty <= 0)
          return (
            <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold">
              OUT OF STOCK
            </span>
          );
        if (qty <= 10)
          return (
            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold">
              LOW STOCK
            </span>
          );
        return (
          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">
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

  /* ---------------- OPEN MODAL HANDLERS ---------------- */
  const handleAddStock = () => {
    setFormData({ name: "", category: "", stock: "", sellingPrice: "" });
    setIsEditing(false);
    setEditingId(null);
    setEditingProductId(null);
    setIsModalOpen(true);
  };

  const handleEditStock = (inv) => {
    setFormData({
      name: inv.product?.name || "",
      category: inv.product?.category || "",
      stock: inv.quantity || 0,
      sellingPrice: inv.product?.basePrice || 0,
    });
    setIsEditing(true);
    setEditingId(inv.id);
    setEditingProductId(inv.productId);
    setIsModalOpen(true);
  };

  /* ---------------- DELETE INVENTORY ---------------- */
  const handleDeleteStock = async (inv) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${inv.product?.name} from inventory?`,
      )
    )
      return;

    try {
      await inventoryService.deleteInventory(inv.id);
      toast.success("Inventory entry deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete inventory",
      );
    }
  };

  /* ---------------- SUBMIT FORM ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const stockQty = parseInt(formData.stock) || 0;
    const basePrice = parseFloat(formData.sellingPrice) || 0;

    try {
      // 1. IS EDITING AN EXISTING INVENTORY ROW?
      if (isEditing && editingId) {
        // Update product base defaults
        await productService.updateProduct(editingProductId, {
          name: formData.name,
          category: formData.category,
          basePrice,
        });

        // Exact override update via id for stock
        await inventoryService.updateInventory(
          editingId,
          stockQty,
          "Manual Override",
        );
        toast.success("Inventory updated successfully");
      }

      // 2. CREATING NEW ENTRY
      else {
        // Check if product already exists in the master list, case-insensitive
        let productIdToUse = null;
        const existingProduct = productsMaster.find(
          (p) => p.name.toLowerCase() === formData.name.toLowerCase(),
        );

        if (existingProduct) {
          // It exists! Just update its defaults if needed
          productIdToUse = existingProduct.id;
          await productService.updateProduct(productIdToUse, {
            category: formData.category,
            basePrice,
          });

          // Check if it already has an inventory record though!
          const existingInventoryRow = inventories.find(
            (inv) => inv.productId === productIdToUse,
          );
          if (existingInventoryRow) {
            // Already has inventory, just exact override it
            await inventoryService.updateInventory(
              existingInventoryRow.id,
              stockQty,
              "Initial Manual Setup",
            );
            toast.success(
              "Existing inventory found; updated stock successfully",
            );
          } else {
            // Does not have an inventory row yet, create it!
            await inventoryService.createInventory(productIdToUse, stockQty);
            toast.success("Initial stock created successfully");
          }
        } else {
          // Doesn't exist at all, we must create the product first
          const newProductRes = await productService.createProduct({
            name: formData.name,
            category: formData.category,
            basePrice,
            unitSize: "N/A", // Fallback since it wasn't requested in form, can be changed later
          });

          productIdToUse = newProductRes.id || newProductRes.data?.id;

          if (!productIdToUse)
            throw new Error("Could not retrieve new product ID");

          // Then create inventory entry
          await inventoryService.createInventory(productIdToUse, stockQty);
          toast.success("New product and stock added successfully");
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
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
        <button
          onClick={handleAddStock}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus size={18} />
          <span>Add Inventory</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          data={inventories}
          isLoading={isLoading}
          onEdit={handleEditStock}
          onDelete={handleDeleteStock}
        />
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
      />
    </div>
  );
}
