import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
  Download,
  Upload,
} from "lucide-react";

export default function InventoryPanel({ onBack, onScan }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    brand: "",
    category: "",
    stock: 0,
    min_stock: 0,
    price: 0,
    cost_price: 0,
    gst_percentage: 12,
    batch_number: "",
    expiry_date: "",
    manufacturer: "",
    composition: "",
  });

  const queryClient = useQueryClient();

  // Fetch medicines
  const {
    data: medicinesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medicines", searchQuery, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await fetch(`/api/medicines?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch medicines");
      }
      return response.json();
    },
  });

  const medicines = medicinesData?.medicines || [];

  // Add medicine mutation
  const addMedicineMutation = useMutation({
    mutationFn: async (medicineData) => {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicineData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add medicine");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      setShowAddModal(false);
      setNewMedicine({
        name: "",
        brand: "",
        category: "",
        stock: 0,
        min_stock: 0,
        price: 0,
        cost_price: 0,
        gst_percentage: 12,
        batch_number: "",
        expiry_date: "",
        manufacturer: "",
        composition: "",
      });
    },
    onError: (error) => {
      console.error("Error adding medicine:", error);
      alert(`Error: ${error.message}`);
    },
  });

  // Update medicine mutation
  const updateMedicineMutation = useMutation({
    mutationFn: async ({ id, ...medicineData }) => {
      const response = await fetch(`/api/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicineData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update medicine");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      setEditingMedicine(null);
    },
    onError: (error) => {
      console.error("Error updating medicine:", error);
      alert(`Error: ${error.message}`);
    },
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/medicines/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete medicine");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: (error) => {
      console.error("Error deleting medicine:", error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleAddMedicine = (e) => {
    e.preventDefault();
    addMedicineMutation.mutate(newMedicine);
  };

  const handleUpdateMedicine = (medicine) => {
    setEditingMedicine(medicine);
  };

  const handleDeleteMedicine = (medicine) => {
    if (confirm(`Are you sure you want to delete ${medicine.name}?`)) {
      deleteMedicineMutation.mutate(medicine.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "low":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "expiring":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-white">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-red-400">
          Error loading inventory: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg glass-panel hover:neon-border transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Inventory Management
            </h1>
            <p className="text-white/60">
              Track and manage your medicine stock
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
          <button
            onClick={onScan}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200"
          >
            <Package className="w-4 h-4" />
            Scan Item
          </button>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medicines, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none transition-all duration-200"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 glass-panel rounded-lg text-white bg-transparent focus:neon-border outline-none"
            >
              <option value="all" className="bg-gray-800">
                All Status
              </option>
              <option value="good" className="bg-gray-800">
                Good Stock
              </option>
              <option value="low" className="bg-gray-800">
                Low Stock
              </option>
              <option value="expiring" className="bg-gray-800">
                Expiring Soon
              </option>
            </select>

            {/* Export/Import */}
            <button className="p-3 glass-panel rounded-lg hover:neon-border transition-all duration-200">
              <Download className="w-5 h-5 text-white" />
            </button>
            <button className="p-3 glass-panel rounded-lg hover:neon-border transition-all duration-200">
              <Upload className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  {medicines.length}
                </div>
                <div className="text-white/60 text-sm">Total Items</div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-600">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  {medicines.filter((m) => m.status === "low").length}
                </div>
                <div className="text-white/60 text-sm">Low Stock</div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  {medicines.filter((m) => m.status === "expiring").length}
                </div>
                <div className="text-white/60 text-sm">Expiring Soon</div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  ₹
                  {medicines
                    .reduce((sum, m) => sum + m.stock * m.cost_price, 0)
                    .toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">Total Value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/80 font-medium p-4">
                    Medicine
                  </th>
                  <th className="text-left text-white/80 font-medium p-4">
                    Category
                  </th>
                  <th className="text-left text-white/80 font-medium p-4">
                    Stock
                  </th>
                  <th className="text-left text-white/80 font-medium p-4">
                    Price
                  </th>
                  <th className="text-left text-white/80 font-medium p-4">
                    Batch/Expiry
                  </th>
                  <th className="text-left text-white/80 font-medium p-4">
                    Status
                  </th>
                  <th className="text-left text-white/80 font-medium p-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div>
                        <div className="text-white font-medium">
                          {medicine.name}
                        </div>
                        <div className="text-white/60 text-sm">
                          {medicine.brand}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/80">{medicine.category}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white font-medium">
                          {medicine.stock} units
                        </div>
                        <div className="text-white/60 text-sm">
                          Min: {medicine.min_stock}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white font-medium">
                          ₹{medicine.price}
                        </div>
                        <div className="text-white/60 text-sm">
                          Cost: ₹{medicine.cost_price}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white/80">
                          {medicine.batch_number}
                        </div>
                        <div className="text-white/60 text-sm">
                          {medicine.expiry_date}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(medicine.status)}`}
                      >
                        {medicine.status === "good"
                          ? "Good Stock"
                          : medicine.status === "low"
                            ? "Low Stock"
                            : "Expiring Soon"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateMedicine(medicine)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-white/60 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-white font-semibold mb-6">Add New Medicine</h3>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedicine.name}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, name: e.target.value })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="Enter medicine name"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedicine.brand}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, brand: e.target.value })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedicine.category}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="e.g., Analgesic, Antibiotic"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMedicine.batch_number}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        batch_number: e.target.value,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="Enter batch number"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMedicine.stock}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Min Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMedicine.min_stock}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        min_stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newMedicine.cost_price}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        cost_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newMedicine.price}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    GST %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newMedicine.gst_percentage}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        gst_percentage: parseFloat(e.target.value) || 12,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                    placeholder="12.00"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newMedicine.expiry_date}
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        expiry_date: e.target.value,
                      })
                    }
                    className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={newMedicine.manufacturer}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      manufacturer: e.target.value,
                    })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Composition
                </label>
                <textarea
                  value={newMedicine.composition}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      composition: e.target.value,
                    })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none resize-none"
                  rows="3"
                  placeholder="Enter medicine composition"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 p-3 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMedicineMutation.isLoading}
                  className="flex-1 p-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                >
                  {addMedicineMutation.isLoading ? "Adding..." : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
