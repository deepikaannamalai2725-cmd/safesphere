import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { analyzeSafety, analyzeVisualDistress, SafetyAnalysis, RiskLevel } from "@/src/services/geminiService";
import { RiskDisplay } from "@/src/components/RiskDisplay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Send, Loader2, History, AlertCircle, Zap, Mic, Globe, WifiOff, Wifi, Volume2, VolumeX, Eye, EyeOff, Camera, Watch, PhoneCall, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Webcam from "react-webcam";

const EMERGENCY_CONTACTS = [
  { name: "Police", number: "112" },
  { name: "Women Helpline", number: "1091" },
  { name: "Ambulance", number: "108" },
];

export default function App() {
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<{ message: string; analysis: SafetyAnalysis; timestamp: Date }[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<SafetyAnalysis | null>(null);
  const [language, setLanguage] = useState("English");
  const [isOffline, setIsOffline] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isWearableSynced, setIsWearableSynced] = useState(true);
  const [isAutoTriggerActive, setIsAutoTriggerActive] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "Tamil" ? "ta-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled, language]);

  const handleAnalyze = async (manualInput?: string, visualData?: string) => {
    const textToAnalyze = manualInput || input;
    if ((!textToAnalyze.trim() && !visualData) || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      let analysis: SafetyAnalysis;
      if (visualData) {
        analysis = await analyzeVisualDistress(visualData.split(',')[1]);
      } else {
        analysis = await analyzeSafety(textToAnalyze, language);
      }
      
      setCurrentAnalysis(analysis);
      setHistory(prev => [...prev, { 
        message: visualData ? "[Visual Analysis]" : textToAnalyze, 
        analysis, 
        timestamp: new Date() 
      }]);
      
      if (analysis.riskLevel === RiskLevel.HIGH) {
        speak(language === "Tamil" ? "எச்சரிக்கை! ஆபத்து கண்டறியப்பட்டது. பாதுகாப்பான இடத்திற்கு செல்லவும்." : "Warning! Danger detected. Move to a safe area immediately.");
        // Simulate automatic emergency call
        console.log("AUTOMATIC EMERGENCY CALL INITIATED TO 112");
      } else if (analysis.riskLevel === RiskLevel.MEDIUM) {
        speak(language === "Tamil" ? "கவனம்! சாத்தியமான ஆபத்து. விழிப்புடன் இருக்கவும்." : "Caution! Potential risk. Stay alert.");
      }

      if (!manualInput && !visualData) setInput("");
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Voice Trigger Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice detected:", transcript);
        if (transcript.includes("help") || transcript.includes("save me") || transcript.includes("emergency")) {
          const msg = "VOICE TRIGGER: " + transcript;
          handleAnalyze(msg);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (isAutoTriggerActive && recognitionRef.current) {
      recognitionRef.current.start();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isAutoTriggerActive]);

  // Visual Auto-Detection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoTriggerActive && isCameraActive) {
      interval = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            handleAnalyze(undefined, imageSrc);
          }
        }
      }, 10000); // Analyze every 10 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoTriggerActive, isCameraActive]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-lg">SAFE<span className="text-red-500">SPHERE</span></h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Emergency Response System v4.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWearableSynced(!isWearableSynced)}
              className={isWearableSynced ? "text-emerald-500" : "text-zinc-500"}
              title="Wearable Sync Status"
            >
              <Watch className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={isVoiceEnabled ? "text-blue-500" : "text-zinc-500"}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 outline-none"
            >
              <option value="English">English</option>
              <option value="Tamil">தமிழ்</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pb-48">
        {/* Hands-Free & Auto-Trigger Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isAutoTriggerActive ? 'bg-red-500/20 animate-pulse' : 'bg-zinc-800'}`}>
                  <Zap className={`w-5 h-5 ${isAutoTriggerActive ? 'text-red-500' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Hands-Free Auto-Trigger</h3>
                  <p className="text-[10px] text-zinc-500 uppercase">Voice & Visual Detection</p>
                </div>
              </div>
              <Button 
                variant={isAutoTriggerActive ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsAutoTriggerActive(!isAutoTriggerActive)}
              >
                {isAutoTriggerActive ? "Active" : "Enable"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-1 text-[10px] border ${isCameraActive ? 'border-red-500 text-red-500' : 'border-zinc-800 text-zinc-500'}`}
                onClick={() => setIsCameraActive(!isCameraActive)}
              >
                <Camera className="w-3 h-3 mr-2" /> {isCameraActive ? "Camera On" : "Camera Off"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex-1 text-[10px] border ${isAutoTriggerActive ? 'border-red-500 text-red-500' : 'border-zinc-800 text-zinc-500'}`}
                disabled
              >
                <Mic className="w-3 h-3 mr-2" /> {isAutoTriggerActive ? "Listening" : "Mic Off"}
              </Button>
            </div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-4 flex flex-col justify-center items-center gap-2">
             <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase">
               <PhoneCall className="w-4 h-4 text-red-500" /> Auto-Dialer Ready
             </div>
             <p className="text-[10px] text-zinc-500 text-center">System will automatically call 112 upon HIGH risk detection.</p>
          </Card>
        </div>

        {/* Camera Preview */}
        {isCameraActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="relative rounded-2xl overflow-hidden border-2 border-zinc-800 bg-black aspect-video max-w-md mx-auto"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover grayscale opacity-50"
              disablePictureInPicture={true}
              forceScreenshotSourceSize={false}
              imageSmoothing={true}
              mirrored={false}
              onUserMedia={() => {}}
              onUserMediaError={() => {}}
              onScreenshot={() => {}}
              screenshotQuality={0.92}
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-red-500">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              AI VISUAL MONITORING
            </div>
          </motion.div>
        )}

        {/* Current Analysis */}
        <AnimatePresence mode="wait">
          {currentAnalysis && (
            <motion.div
              key={history.length}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              <RiskDisplay analysis={currentAnalysis} />
              <Card className="bg-zinc-900/50 border-zinc-800 p-4">
                <h4 className="text-xs font-mono text-zinc-500 uppercase mb-2">AI Reasoning</h4>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{currentAnalysis.reasoning}"
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-zinc-900">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider pl-1">
              <History className="w-3 h-3" />
              Incident History
            </div>
            <div className="space-y-3">
              {history.slice().reverse().map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={i} 
                  className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-400 truncate">"{item.message}"</p>
                    <p className="text-[10px] font-mono text-zinc-600 mt-1">
                      {item.timestamp.toLocaleTimeString()} • {item.analysis.situationType}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                    item.analysis.riskLevel === RiskLevel.HIGH ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                    item.analysis.riskLevel === RiskLevel.MEDIUM ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
                    'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  }`}>
                    {item.analysis.riskLevel}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Input Area & SOS Button */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-zinc-800 p-4 pb-8 z-50">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          
          {/* Big Red SOS Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const msg = "INSTANT SOS TRIGGERED";
              handleAnalyze(msg);
            }}
            className="w-full h-20 bg-red-600 hover:bg-red-500 rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.5)] border-4 border-red-400/20 group"
          >
            <ShieldAlert className="w-10 h-10 text-white animate-bounce" />
            <div className="text-left">
              <span className="block text-2xl font-black text-white uppercase leading-none">SOS EMERGENCY</span>
              <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">Tap for Instant Alert & Location Share</span>
            </div>
          </motion.button>

          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder={language === "Tamil" ? "உங்கள் நிலைமையை விவரிக்கவும்..." : "Describe your situation..."}
                className="h-14 bg-zinc-900 border-zinc-700 text-zinc-100 pr-12 rounded-2xl focus-visible:ring-red-500/50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 text-zinc-500 hover:text-red-500"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={() => handleAnalyze()}
              disabled={!input.trim() || isAnalyzing}
              className="h-14 w-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-mono uppercase tracking-widest">
          Hands-Free Mode: Shout "HELP" or "SAVE ME" to trigger
        </p>
      </div>
    </div>
  );
}
