import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  BarChart3,
  Mic,
  MicOff,
  Scan,
  Activity,
  Pill
} from "lucide-react";

export default function Sidebar({ activePanel, onNavigate, onVoiceToggle, voiceActive }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigationItems = [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      description: "Overview & Analytics" 
    },
    { 
      id: "sales", 
      name: "Sales & Billing", 
      icon: ShoppingCart, 
      description: "Point of Sale" 
    },
    { 
      id: "inventory", 
      name: "Inventory", 
      icon: Package, 
      description: "Stock Management" 
    },
    { 
      id: "prescriptions", 
      name: "Prescriptions", 
      icon: FileText, 
      description: "Rx Management" 
    },
    { 
      id: "customers", 
      name: "Customers", 
      icon: Users, 
      description: "Patient Database" 
    },
    { 
      id: "reports", 
      name: "Reports", 
      icon: BarChart3, 
      description: "Analytics & GST" 
    }
  ];

  return (
    <div className="w-72 glass-panel border-r border-white/10 flex flex-col h-full relative">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">MediBill Pro</h1>
            <p className="text-white/60 text-sm">Medical Billing Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id, "right")}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                  isActive
                    ? "neon-border bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Hover glow effect */}
                {(isActive || isHovered) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
                )}
                
                <div className="relative flex items-center gap-3">
                  <Icon
                    size={20}
                    className={`transition-all duration-300 ${
                      isActive ? "text-blue-400" : "text-white/70 group-hover:text-white"
                    }`}
                  />
                  <div className="flex-1 text-left">
                    <div className={`font-medium text-sm ${
                      isActive ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-white/50 group-hover:text-white/70">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10">
        {/* Voice Assistant Button */}
        <button
          onClick={onVoiceToggle}
          className={`w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 mb-3 ${
            voiceActive
              ? "neon-border bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white"
              : "text-white/70 hover:text-white hover:bg-white/5 border border-white/10"
          }`}
        >
          {voiceActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl animate-pulse" />
          )}
          
          <div className="relative flex items-center gap-3">
            {voiceActive ? (
              <Mic size={20} className="text-green-400" />
            ) : (
              <MicOff size={20} className="text-white/70 group-hover:text-white" />
            )}
            <div className="flex-1 text-left">
              <div className={`font-medium text-sm ${
                voiceActive ? "text-white" : "text-white/70 group-hover:text-white"
              }`}>
                Voice Assistant
              </div>
              <div className="text-xs text-white/50 group-hover:text-white/70">
                {voiceActive ? "Listening..." : "Click to activate"}
              </div>
            </div>
          </div>
        </button>

        {/* System Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
          <Activity size={14} className="text-green-400" />
          <span className="text-xs text-white/70">System Online</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}