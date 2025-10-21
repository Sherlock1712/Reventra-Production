import { useState } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Camera,
  Search,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function PrescriptionPanel({ onBack, onScan }) {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientName: "Ramesh Kumar",
      doctorName: "Dr. Sharma",
      date: "2024-10-20",
      status: "fulfilled",
      medicines: ["Paracetamol 500mg", "Cough Syrup"],
      image: "https://via.placeholder.com/300x200?text=Prescription+1",
      notes: "Take after meals"
    },
    {
      id: 2,
      patientName: "Priya Sharma",
      doctorName: "Dr. Patel",
      date: "2024-10-19",
      status: "pending",
      medicines: ["Amoxicillin 250mg", "Vitamin D3"],
      image: "https://via.placeholder.com/300x200?text=Prescription+2",
      notes: "Complete course as prescribed"
    },
    {
      id: 3,
      patientName: "Amit Patel",
      doctorName: "Dr. Singh",
      date: "2024-10-18",
      status: "processing",
      medicines: ["Aspirin 325mg"],
      image: "https://via.placeholder.com/300x200?text=Prescription+3",
      notes: "Take with water"
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && prescription.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "fulfilled": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "fulfilled": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <Clock className="w-4 h-4" />;
      case "pending": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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
            <h1 className="text-2xl font-bold text-white">Prescription Management</h1>
            <p className="text-white/60">Upload and manage patient prescriptions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload Prescription
          </button>
          <button
            onClick={onScan}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200"
          >
            <Camera className="w-4 h-4" />
            Quick Scan
          </button>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none transition-all duration-200"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 glass-panel rounded-lg text-white bg-transparent focus:neon-border outline-none"
          >
            <option value="all" className="bg-gray-800">All Status</option>
            <option value="pending" className="bg-gray-800">Pending</option>
            <option value="processing" className="bg-gray-800">Processing</option>
            <option value="fulfilled" className="bg-gray-800">Fulfilled</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">{prescriptions.length}</div>
                <div className="text-white/60 text-sm">Total Prescriptions</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  {prescriptions.filter(p => p.status === "pending").length}
                </div>
                <div className="text-white/60 text-sm">Pending</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  {prescriptions.filter(p => p.status === "processing").length}
                </div>
                <div className="text-white/60 text-sm">Processing</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">
                  {prescriptions.filter(p => p.status === "fulfilled").length}
                </div>
                <div className="text-white/60 text-sm">Fulfilled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="glass-panel rounded-xl p-6 hover:neon-border transition-all duration-200">
              {/* Prescription Image */}
              <div className="mb-4">
                <img
                  src={prescription.image}
                  alt={`Prescription for ${prescription.patientName}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>

              {/* Patient Info */}
              <div className="mb-4">
                <h3 className="text-white font-semibold text-lg mb-1">{prescription.patientName}</h3>
                <p className="text-white/60 text-sm mb-2">Dr. {prescription.doctorName}</p>
                <p className="text-white/60 text-sm">{prescription.date}</p>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                  {getStatusIcon(prescription.status)}
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </span>
              </div>

              {/* Medicines */}
              <div className="mb-4">
                <h4 className="text-white/80 text-sm font-medium mb-2">Medicines:</h4>
                <div className="space-y-1">
                  {prescription.medicines.map((medicine, index) => (
                    <div key={index} className="text-white/60 text-sm">• {medicine}</div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="mb-4">
                  <h4 className="text-white/80 text-sm font-medium mb-1">Notes:</h4>
                  <p className="text-white/60 text-sm">{prescription.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-6">Upload New Prescription</h3>
            
            <div className="space-y-4">
              {/* Patient Name */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Patient Name</label>
                <input
                  type="text"
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  placeholder="Enter patient name"
                />
              </div>

              {/* Doctor Name */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Doctor Name</label>
                <input
                  type="text"
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                  placeholder="Enter doctor name"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Prescription Image</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm mb-2">Drag & drop or click to upload</p>
                  <button className="text-blue-400 text-sm hover:text-blue-300">Browse Files</button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Notes (Optional)</label>
                <textarea
                  className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none resize-none"
                  rows="3"
                  placeholder="Additional notes or instructions"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 p-3 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  Cancel
                </button>
                <button className="flex-1 p-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}