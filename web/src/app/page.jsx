import { useState, useEffect } from "react";
import Sidebar from "../components/medical/Sidebar";
import Dashboard from "../components/medical/Dashboard";
import SalesPanel from "../components/medical/SalesPanel";
import InventoryPanel from "../components/medical/InventoryPanel";
import PrescriptionPanel from "../components/medical/PrescriptionPanel";
import CustomersPanel from "../components/medical/CustomersPanel";
import ReportsPanel from "../components/medical/ReportsPanel";
import VoiceAssistant from "../components/medical/VoiceAssistant";
import ScannerModal from "../components/medical/ScannerModal";

export default function MedicalBillingApp() {
  const [activePanel, setActivePanel] = useState("dashboard");
  const [slideDirection, setSlideDirection] = useState("right");
  const [panelHistory, setPanelHistory] = useState(["dashboard"]);
  const [voiceListening, setVoiceListening] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Handle panel navigation with slide animations
  const navigateToPanel = (panelName, direction = "right") => {
    if (panelName === activePanel) return;
    
    setSlideDirection(direction);
    setActivePanel(panelName);
    
    // Update history for back navigation
    setPanelHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== panelName) {
        newHistory.push(panelName);
      }
      return newHistory.slice(-5); // Keep last 5 for performance
    });
  };

  // Handle back navigation
  const navigateBack = () => {
    if (panelHistory.length > 1) {
      const newHistory = [...panelHistory];
      newHistory.pop(); // Remove current
      const previousPanel = newHistory[newHistory.length - 1];
      
      setPanelHistory(newHistory);
      setSlideDirection("left");
      setActivePanel(previousPanel);
    }
  };

  // Voice command handling
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes("dashboard")) {
      navigateToPanel("dashboard", "left");
    } else if (lowerCommand.includes("sales") || lowerCommand.includes("billing")) {
      navigateToPanel("sales", "right");
    } else if (lowerCommand.includes("inventory") || lowerCommand.includes("stock")) {
      navigateToPanel("inventory", "right");
    } else if (lowerCommand.includes("prescription")) {
      navigateToPanel("prescriptions", "right");
    } else if (lowerCommand.includes("customer")) {
      navigateToPanel("customers", "right");
    } else if (lowerCommand.includes("report")) {
      navigateToPanel("reports", "right");
    } else if (lowerCommand.includes("scan")) {
      setScannerOpen(true);
    }
  };

  // Render active panel content
  const renderActivePanel = () => {
    switch (activePanel) {
      case "dashboard":
        return <Dashboard onNavigate={navigateToPanel} onScan={() => setScannerOpen(true)} />;
      case "sales":
        return <SalesPanel onBack={navigateBack} onScan={() => setScannerOpen(true)} />;
      case "inventory":
        return <InventoryPanel onBack={navigateBack} onScan={() => setScannerOpen(true)} />;
      case "prescriptions":
        return <PrescriptionPanel onBack={navigateBack} onScan={() => setScannerOpen(true)} />;
      case "customers":
        return <CustomersPanel onBack={navigateBack} />;
      case "reports":
        return <ReportsPanel onBack={navigateBack} />;
      default:
        return <Dashboard onNavigate={navigateToPanel} onScan={() => setScannerOpen(true)} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
      
      {/* Main app container */}
      <div className="relative h-full flex">
        {/* Sidebar */}
        <Sidebar 
          activePanel={activePanel} 
          onNavigate={navigateToPanel}
          onVoiceToggle={() => setVoiceListening(!voiceListening)}
          voiceActive={voiceListening}
        />

        {/* Main content area with slide animation */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className={`absolute inset-0 transition-transform duration-500 ease-out ${
              slideDirection === "right" 
                ? "transform translate-x-0" 
                : "transform translate-x-0"
            }`}
          >
            {renderActivePanel()}
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant 
        listening={voiceListening}
        onVoiceCommand={handleVoiceCommand}
        onToggle={() => setVoiceListening(!voiceListening)}
      />

      {/* Scanner Modal */}
      {scannerOpen && (
        <ScannerModal 
          onClose={() => setScannerOpen(false)}
          onScan={(data) => {
            console.log("Scanned:", data);
            setScannerOpen(false);
          }}
        />
      )}

      {/* Global styles for glass morphism */}
      <style jsx global>{`
        .glass-panel {
          background: rgba(15, 15, 15, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .neon-border {
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(59, 130, 246, 0.1);
        }
        
        .neon-glow {
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.4),
            0 0 40px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
}