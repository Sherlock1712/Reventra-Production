import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";

export default function CustomersPanel({ onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    date_of_birth: "",
    gender: "",
  });

  const queryClient = useQueryClient();

  // Fetch customers
  const {
    data: customersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      return response.json();
    },
  });

  const customers = customersData?.customers || [];

  // Add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowAddModal(false);
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
        date_of_birth: "",
        gender: "",
      });
    },
    onError: (error) => {
      console.error("Error adding customer:", error);
      alert(`Error: ${error.message}`);
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...customerData }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditingCustomer(null);
    },
    onError: (error) => {
      console.error("Error updating customer:", error);
      alert(`Error: ${error.message}`);
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete customer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      console.error("Error deleting customer:", error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    addCustomerMutation.mutate(newCustomer);
  };

  const handleUpdateCustomer = (customer) => {
    setEditingCustomer(customer);
  };

  const handleDeleteCustomer = (customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      deleteCustomerMutation.mutate(customer.id);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-white">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-red-400">
          Error loading customers: {error.message}
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
            <h1 className="text-2xl font-bold text-white">Customer Database</h1>
            <p className="text-white/60">
              Manage patient and customer information
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none transition-all duration-200"
          />
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="glass-panel rounded-xl p-6 hover:neon-border transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {customer.name}
                    </h3>
                    <p className="text-white/60 text-sm">
                      Customer ID: {customer.id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateCustomer(customer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60" />
                  <span className="text-white/80 text-sm">
                    {customer.phone}
                  </span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span className="text-white/80 text-sm">
                      {customer.email}
                    </span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-white/60 mt-0.5" />
                    <span className="text-white/80 text-sm">
                      {customer.address}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/60 text-xs">Last Visit</p>
                    <p className="text-white text-sm">{customer.last_visit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs">Total Purchases</p>
                    <p className="text-green-400 font-semibold">
                      {customer.total_purchases}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No customers found</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-white font-semibold mb-6">Add New Customer</h3>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  placeholder="customer@email.com"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={newCustomer.date_of_birth}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      date_of_birth: e.target.value,
                    })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Gender
                </label>
                <select
                  value={newCustomer.gender}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, gender: e.target.value })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white bg-transparent focus:neon-border outline-none"
                >
                  <option value="" className="bg-gray-800">
                    Select Gender
                  </option>
                  <option value="Male" className="bg-gray-800">
                    Male
                  </option>
                  <option value="Female" className="bg-gray-800">
                    Female
                  </option>
                  <option value="Other" className="bg-gray-800">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Address
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none resize-none"
                  rows="3"
                  placeholder="Enter full address"
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
                  disabled={addCustomerMutation.isLoading}
                  className="flex-1 p-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                >
                  {addCustomerMutation.isLoading ? "Adding..." : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
