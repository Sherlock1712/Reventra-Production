import { useState, useEffect } from "react";
import { X, Scan, Camera, Upload, Search } from "lucide-react";

export default function ScannerModal({ onClose, onScan }) {
  const [scanMode, setScanMode] = useState("barcode"); // barcode, qr, manual
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [manualCode, setManualCode] = useState("");

  // Mock scanner - simulate scanning after 2 seconds
  useEffect(() => {
    if (isScanning) {
      const timeout = setTimeout(() => {
        const mockBarcodes = [
          "8901030870927", // Paracetamol
          "8901030870934", // Cough Syrup
          "8901030870941", // Vitamin D3
          "8901030870958", // Amoxicillin
        ];
        
        const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
        setScanResult(randomBarcode);
        setIsScanning(false);
        
        // Auto-trigger scan callback after showing result
        setTimeout(() => {
          onScan({ type: scanMode, code: randomBarcode });
        }, 1500);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isScanning, scanMode, onScan]);

  const startScanning = () => {
    setScanResult("");
    setIsScanning(true);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan({ type: "manual", code: manualCode.trim() });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-panel rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Scanner</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Scan Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setScanMode("barcode")}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              scanMode === "barcode"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            }`}
          >
            Barcode
          </button>
          <button
            onClick={() => setScanMode("qr")}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              scanMode === "qr"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setScanMode("manual")}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              scanMode === "manual"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            }`}
          >
            Manual
          </button>
        </div>

        {/* Scanner Content */}
        {scanMode === "manual" ? (
          /* Manual Entry */
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Enter Code Manually</label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full p-3 glass-panel rounded-lg text-white placeholder-white/40 focus:neon-border outline-none"
                placeholder="Enter barcode or product code"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              Search Product
            </button>
          </form>
        ) : (
          /* Camera Scanner */
          <div className="space-y-4">
            {/* Camera View */}
            <div className="relative">
              <div className="aspect-square bg-black/50 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden">
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/80">Scanning...</p>
                    <p className="text-white/60 text-sm mt-1">
                      {scanMode === "barcode" ? "Point camera at barcode" : "Point camera at QR code"}
                    </p>
                  </div>
                ) : scanResult ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scan className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-green-400 font-medium">Scan Successful!</p>
                    <p className="text-white/80 text-sm mt-1 font-mono">{scanResult}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">
                      {scanMode === "barcode" ? "Ready to scan barcode" : "Ready to scan QR code"}
                    </p>
                  </div>
                )}

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse">
                      <style jsx>{`
                        @keyframes scan {
                          0% { top: 10%; }
                          50% { top: 50%; }
                          100% { top: 90%; }
                        }
                        .animate-scan {
                          animation: scan 2s ease-in-out infinite;
                        }
                      `}</style>
                    </div>
                  </div>
                )}

                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/40"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/40"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/40"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/40"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isScanning && !scanResult && (
                <button
                  onClick={startScanning}
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                >
                  <Scan className="w-4 h-4" />
                  Start Scanning
                </button>
              )}
              
              {scanResult && (
                <button
                  onClick={() => {
                    setScanResult("");
                    startScanning();
                  }}
                  className="flex-1 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                >
                  Scan Again
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-3 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
              >
                Cancel
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center text-white/60 text-sm">
              <p>
                {scanMode === "barcode" 
                  ? "Position the barcode within the frame for automatic scanning"
                  : "Position the QR code within the frame for automatic scanning"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}