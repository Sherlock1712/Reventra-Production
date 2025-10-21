import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Minus,
  Scan,
  Search,
  ShoppingCart,
  CreditCard,
  Receipt,
  User,
  Calculator,
  Trash2
} from "lucide-react";

export default function SalesPanel({ onBack, onScan }) {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [gstTotal, setGstTotal] = useState(0);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Sample medicines data
  const medicines = [
    { id: 1, name: "Paracetamol 500mg", price: 25, stock: 120, gst: 12, batch: "P001", expiry: "2025-12-31" },
    { id: 2, name: "Amoxicillin 250mg", price: 45, stock: 80, gst: 12, batch: "A002", expiry: "2025-11-30" },
    { id: 3, name: "Cough Syrup", price: 85, stock: 45, gst: 18, batch: "C003", expiry: "2025-10-15" },
    { id: 4, name: "Vitamin D3", price: 120, stock: 60, gst: 18, batch: "V004", expiry: "2026-01-20" },
    { id: 5, name: "Aspirin 325mg", price: 30, stock: 95, gst: 12, batch: "A005", expiry: "2025-09-30" }
  ];

  const customers = [
    { id: 1, name: "Ramesh Kumar", phone: "+91 9876543210", email: "ramesh@email.com" },
    { id: 2, name: "Priya Sharma", phone: "+91 9876543211", email: "priya@email.com" },
    { id: 3, name: "Amit Patel", phone: "+91 9876543212", email: "amit@email.com" }
  ];

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gstAmount = cart.reduce((sum, item) => 
      sum + ((item.price * item.quantity * item.gst) / 100), 0
    );
    setTotal(subtotal);
    setGstTotal(subtotal + gstAmount);
  }, [cart]);

  const addToCart = (medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: Math.min(item.quantity + 1, medicine.stock) }
            : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, Math.min(item.quantity + delta, item.stock));
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
  };

  const processSale = () => {
    if (cart.length === 0) return;
    
    // Here you would normally process the sale
    alert(`Sale processed for ₹${gstTotal.toFixed(2)}`);
    clearCart();
  };

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
            <h1 className="text-2xl font-bold text-white">Sales & Billing</h1>
            <p className="text-white/60">Process customer purchases</p>
          </div>
        </div>
        <button
          onClick={onScan}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200"
        >
          <Scan className="w-4 h-4" />
          Quick Scan
        </button>
      </div>

      <div className="flex h-full">
        {/* Left Panel - Product Search & Selection */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none transition-all duration-200"
            />
          </div>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map((medicine) => {
              const inCart = cart.find(item => item.id === medicine.id);
              
              return (
                <div
                  key={medicine.id}
                  className="glass-panel rounded-lg p-4 hover:neon-border transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{medicine.name}</h3>
                      <div className="text-white/60 text-sm">
                        Batch: {medicine.batch} • Exp: {medicine.expiry}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">₹{medicine.price}</div>
                      <div className="text-white/60 text-xs">GST: {medicine.gst}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 text-sm">
                      Stock: {medicine.stock}
                    </div>
                    
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(medicine.id, -1)}
                          className="p-1 rounded bg-red-600 hover:bg-red-500 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="text-white font-medium w-8 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(medicine.id, 1)}
                          className="p-1 rounded bg-green-600 hover:bg-green-500 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(medicine)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Cart & Checkout */}
        <div className="w-96 glass-panel border-l border-white/10 flex flex-col">
          {/* Customer Selection */}
          <div className="p-4 border-b border-white/10">
            {customer ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{customer.name}</div>
                  <div className="text-white/60 text-sm">{customer.phone}</div>
                </div>
                <button
                  onClick={() => setCustomer(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomerSearch(true)}
                className="w-full flex items-center gap-2 p-3 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Select Customer (Optional)
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length} items)
            </h3>
            
            {cart.length === 0 ? (
              <div className="text-white/60 text-center py-8">
                Cart is empty
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{item.name}</div>
                        <div className="text-white/60 text-xs">
                          ₹{item.price} × {item.quantity}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 rounded bg-red-600/50 hover:bg-red-600 transition-colors"
                        >
                          <Minus className="w-2 h-2 text-white" />
                        </button>
                        <span className="text-white text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 rounded bg-green-600/50 hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-2 h-2 text-white" />
                        </button>
                      </div>
                      <div className="text-white font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>GST:</span>
                  <span>₹{(gstTotal - total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold text-lg border-t border-white/10 pt-2">
                  <span>Total:</span>
                  <span>₹{gstTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={processSale}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Process Payment
                </button>
                <button
                  onClick={clearCart}
                  className="w-full p-3 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-xl p-6 w-96 max-h-80">
            <h3 className="text-white font-semibold mb-4">Select Customer</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customers.map((cust) => (
                <button
                  key={cust.id}
                  onClick={() => {
                    setCustomer(cust);
                    setShowCustomerSearch(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="text-white font-medium">{cust.name}</div>
                  <div className="text-white/60 text-sm">{cust.phone}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustomerSearch(false)}
              className="w-full mt-4 p-2 border border-white/20 rounded-lg text-white/60 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}