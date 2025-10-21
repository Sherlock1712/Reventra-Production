import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  Scan,
  Mic,
  BarChart3,
  ShoppingCart,
  FileText
} from "lucide-react";

export default function Dashboard({ onNavigate, onScan }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample dashboard data
  const metrics = [
    {
      title: "Today's Sales",
      value: "₹45,280",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Total Customers",
      value: "1,247",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: "+5",
      trend: "down",
      icon: Package,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Prescriptions",
      value: "156",
      change: "+15.3%",
      trend: "up",
      icon: FileText,
      color: "from-purple-500 to-indigo-600"
    }
  ];

  const recentSales = [
    { id: "INV-2024-001", customer: "Ramesh Kumar", amount: "₹1,250", time: "2 min ago", items: 5 },
    { id: "INV-2024-002", customer: "Priya Sharma", amount: "₹890", time: "8 min ago", items: 3 },
    { id: "INV-2024-003", customer: "Amit Patel", amount: "₹2,150", time: "15 min ago", items: 8 },
    { id: "INV-2024-004", customer: "Sunita Devi", amount: "₹675", time: "23 min ago", items: 2 }
  ];

  const lowStockAlerts = [
    { name: "Paracetamol 500mg", stock: 12, minStock: 50, urgency: "high" },
    { name: "Amoxicillin 250mg", stock: 8, minStock: 30, urgency: "critical" },
    { name: "Cough Syrup", stock: 15, minStock: 25, urgency: "medium" },
    { name: "Vitamin D3", stock: 5, minStock: 20, urgency: "critical" }
  ];

  const quickActions = [
    { 
      title: "New Sale", 
      description: "Process customer purchase", 
      icon: ShoppingCart, 
      action: () => onNavigate("sales"),
      color: "from-green-500 to-emerald-600"
    },
    { 
      title: "Quick Scan", 
      description: "Barcode/QR scanner", 
      icon: Scan, 
      action: onScan,
      color: "from-blue-500 to-cyan-600"
    },
    { 
      title: "Add Prescription", 
      description: "Upload new prescription", 
      icon: FileText, 
      action: () => onNavigate("prescriptions"),
      color: "from-purple-500 to-indigo-600"
    },
    { 
      title: "Stock Check", 
      description: "Inventory management", 
      icon: Package, 
      action: () => onNavigate("inventory"),
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-sm">
              {currentTime.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-white text-lg font-mono">
              {currentTime.toLocaleTimeString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === "up";
          
          return (
            <div
              key={index}
              className="glass-panel rounded-xl p-6 hover:neon-border transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isPositive 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-white/60 text-sm">{metric.title}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                onClick={action.action}
                className="glass-panel rounded-xl p-6 hover:neon-border transition-all duration-300 group text-left"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg mb-4 w-fit`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-white font-medium mb-1">{action.title}</div>
                <div className="text-white/60 text-sm">{action.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Sales</h3>
            <button
              onClick={() => onNavigate("sales")}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="text-white font-medium">{sale.customer}</div>
                  <div className="text-white/60 text-sm">{sale.id} • {sale.items} items</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{sale.amount}</div>
                  <div className="text-white/60 text-sm">{sale.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Low Stock Alerts
            </h3>
            <button
              onClick={() => onNavigate("inventory")}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Manage Stock
            </button>
          </div>
          <div className="space-y-4">
            {lowStockAlerts.map((item, index) => {
              const urgencyColors = {
                critical: "bg-red-500/20 text-red-400 border-red-500/30",
                high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              };
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-white/60 text-sm">Min: {item.minStock} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{item.stock} left</div>
                    <div className={`text-xs px-2 py-1 rounded-full border ${urgencyColors[item.urgency]}`}>
                      {item.urgency}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}