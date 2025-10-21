import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Package,
  Users
} from "lucide-react";

export default function ReportsPanel({ onBack }) {
  const [dateRange, setDateRange] = useState("last_month");
  const [reportType, setReportType] = useState("sales");

  const salesData = [
    { date: "Oct 16", sales: 15400, gst: 2772 },
    { date: "Oct 17", sales: 18200, gst: 3276 },
    { date: "Oct 18", sales: 22100, gst: 3978 },
    { date: "Oct 19", sales: 19800, gst: 3564 },
    { date: "Oct 20", sales: 25600, gst: 4608 }
  ];

  const topMedicines = [
    { name: "Paracetamol 500mg", sold: 245, revenue: "₹6,125" },
    { name: "Cough Syrup", sold: 156, revenue: "₹13,260" },
    { name: "Vitamin D3", sold: 89, revenue: "₹10,680" },
    { name: "Amoxicillin 250mg", sold: 78, revenue: "₹3,510" }
  ];

  const gstSummary = {
    totalSales: "₹1,01,200",
    cgst: "₹9,108",
    sgst: "₹9,108",
    igst: "₹0",
    totalTax: "₹18,216"
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
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-white/60">Sales reports and GST compliance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 glass-panel rounded-lg text-white bg-transparent focus:neon-border outline-none"
          >
            <option value="sales" className="bg-gray-800">Sales Report</option>
            <option value="gst" className="bg-gray-800">GST Report</option>
            <option value="inventory" className="bg-gray-800">Inventory Report</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-200">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        {/* Date Range Selector */}
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-5 h-5 text-white/60" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 glass-panel rounded-lg text-white bg-transparent focus:neon-border outline-none"
          >
            <option value="today" className="bg-gray-800">Today</option>
            <option value="yesterday" className="bg-gray-800">Yesterday</option>
            <option value="last_week" className="bg-gray-800">Last 7 Days</option>
            <option value="last_month" className="bg-gray-800">Last 30 Days</option>
            <option value="custom" className="bg-gray-800">Custom Range</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">₹1,01,200</div>
                <div className="text-white/60 text-sm">Total Sales</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              +15.2%
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-600">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">₹18,216</div>
                <div className="text-white/60 text-sm">GST Collected</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              +12.8%
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-600">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">568</div>
                <div className="text-white/60 text-sm">Items Sold</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-purple-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              +8.4%
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-600">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">142</div>
                <div className="text-white/60 text-sm">Customers</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-orange-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              +22.1%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-6">Daily Sales Trend</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {salesData.map((day, index) => {
                const maxSales = Math.max(...salesData.map(d => d.sales));
                const height = (day.sales / maxSales) * 200;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-white text-xs mb-2">₹{(day.sales / 1000).toFixed(1)}k</div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                      style={{ height: `${height}px` }}
                    />
                    <div className="text-white/60 text-xs mt-2">{day.date}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Medicines */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-6">Top Selling Medicines</h3>
            <div className="space-y-4">
              {topMedicines.map((medicine, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{medicine.name}</div>
                    <div className="text-white/60 text-sm">{medicine.sold} units sold</div>
                  </div>
                  <div className="text-green-400 font-semibold">{medicine.revenue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* GST Summary */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-6">GST Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Total Sales (Excl. Tax)</span>
                <span className="text-white font-semibold">{gstSummary.totalSales}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">CGST (9%)</span>
                <span className="text-white font-semibold">{gstSummary.cgst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">SGST (9%)</span>
                <span className="text-white font-semibold">{gstSummary.sgst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">IGST (0%)</span>
                <span className="text-white font-semibold">{gstSummary.igst}</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Tax</span>
                  <span className="text-green-400 font-bold text-lg">{gstSummary.totalTax}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors text-left">
                Generate GSTR-1 Report
              </button>
              <button className="w-full p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400 transition-colors text-left">
                Export Sales Summary
              </button>
              <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-400 transition-colors text-left">
                Inventory Valuation Report
              </button>
              <button className="w-full p-3 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg text-orange-400 transition-colors text-left">
                Customer Purchase History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}