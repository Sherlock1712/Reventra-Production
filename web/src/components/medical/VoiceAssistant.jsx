import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

export default function VoiceAssistant({ listening, onVoiceCommand, onToggle }) {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock voice recognition - replace with actual implementation
  useEffect(() => {
    if (listening) {
      // Simulate voice recognition
      const mockCommands = [
        "Show dashboard",
        "Open sales panel",
        "Check inventory",
        "View prescriptions",
        "Show customer database",
        "Generate reports",
        "Scan barcode"
      ];
      
      // Simulate random voice command after 3 seconds of listening
      const timeout = setTimeout(() => {
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(randomCommand);
        setIsProcessing(true);
        
        setTimeout(() => {
          onVoiceCommand(randomCommand);
          setIsProcessing(false);
          setTranscript("");
          onToggle(); // Stop listening after command
        }, 1500);
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      setTranscript("");
      setIsProcessing(false);
    }
  }, [listening, onVoiceCommand, onToggle]);

  return (
    <>
      {/* Voice Assistant Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full z-50 transition-all duration-300 ${
          listening
            ? "neon-glow bg-gradient-to-r from-green-500 to-blue-500 scale-110"
            : "glass-panel hover:neon-border"
        }`}
      >
        {listening ? (
          <Mic className="w-6 h-6 text-white mx-auto animate-pulse" />
        ) : (
          <MicOff className="w-6 h-6 text-white/70 mx-auto" />
        )}
        
        {/* Pulse animation when listening */}
        {listening && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-green-500/30"></div>
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" style={{ animationDelay: "0.5s" }}></div>
          </>
        )}
      </button>

      {/* Voice Command Overlay */}
      {(listening || transcript || isProcessing) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="glass-panel rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Microphone Icon */}
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                listening ? "bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" : "bg-blue-600"
              }`}>
                <Mic className="w-8 h-8 text-white" />
              </div>

              {/* Status Text */}
              <div className="mb-6">
                {isProcessing ? (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Processing Command...</h3>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                ) : transcript ? (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Command Recognized:</h3>
                    <p className="text-blue-400 text-lg">"{transcript}"</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Listening...</h3>
                    <p className="text-white/60">Say a command like "Show dashboard" or "Open sales"</p>
                  </div>
                )}
              </div>

              {/* Waveform Animation */}
              {listening && !transcript && (
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-green-500 to-blue-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.8s"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Voice Commands Help */}
              {listening && !transcript && (
                <div className="text-left">
                  <h4 className="text-white/80 font-medium mb-3">Try saying:</h4>
                  <div className="space-y-2 text-sm text-white/60">
                    <div>• "Show dashboard"</div>
                    <div>• "Open sales panel"</div>
                    <div>• "Check inventory"</div>
                    <div>• "View prescriptions"</div>
                    <div>• "Show reports"</div>
                    <div>• "Scan barcode"</div>
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              {!isProcessing && (
                <button
                  onClick={onToggle}
                  className="mt-6 px-6 py-2 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}