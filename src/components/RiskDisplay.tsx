import * as React from "react";
import { RiskLevel, SafetyAnalysis } from "@/src/services/geminiService";
import { AlertTriangle, ShieldAlert, ShieldCheck, MapPin, Phone, Ambulance, Info, Brain, Activity, Moon, Navigation, Users, MessageSquare, Bell } from "lucide-react";
import { motion } from "motion/react";

interface RiskDisplayProps {
  analysis: SafetyAnalysis;
  location?: string;
}

export function RiskDisplay({ analysis, location = "Chennai (simulated)" }: RiskDisplayProps) {
  const { riskLevel, riskScore, emotion, isNightRisk, situationType, escapeDirection, nearestCrowdedArea, alertMessagePreview } = analysis;

  if (riskLevel === RiskLevel.HIGH) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-950 border-2 border-red-500 p-6 rounded-xl text-red-100 space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.4)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500 font-bold text-xl animate-pulse">
            <ShieldAlert className="w-8 h-8" />
            <span>🚨 HIGH RISK: {situationType.toUpperCase()} 🚨</span>
          </div>
          <div className="flex gap-2">
            {isNightRisk && (
              <div className="flex items-center gap-1 bg-red-900/50 px-2 py-1 rounded border border-red-500/50 text-xs font-bold text-red-400">
                <Moon className="w-3 h-3" />
                <span>NIGHT</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs font-bold text-white animate-bounce">
              <Bell className="w-3 h-3" />
              <span>ALARM ON</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono bg-black/20 p-4 rounded-lg border border-red-900/30">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>📍 Location: {location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span>📊 Risk Score: {riskScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-red-400" />
            <span>🧠 Emotion: {emotion}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-400" />
            <span>📞 Emergency: 112</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase text-red-400 flex items-center gap-2">
              <Navigation className="w-3 h-3" /> Escape Guidance
            </h4>
            <p className="text-sm font-medium">{escapeDirection}</p>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase text-red-400 flex items-center gap-2">
              <Users className="w-3 h-3" /> Crowd Safety
            </h4>
            <p className="text-sm font-medium">{nearestCrowdedArea}</p>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-lg border border-red-500/10 space-y-2">
          <h4 className="text-xs font-bold uppercase text-red-400 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Auto-Alert Preview
          </h4>
          <p className="text-xs italic text-red-200/70">"{alertMessagePreview}"</p>
        </div>

        <div className="space-y-3 border-t border-red-800 pt-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-red-400">
            <Info className="w-5 h-5" />
            🛑 Immediate Actions:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-red-200 font-medium">
            <li>Stay calm and do not panic</li>
            <li>Move to a safe or crowded place immediately</li>
            <li>Call emergency number (112)</li>
            <li>Share your live location with a trusted contact</li>
            <li>Keep your phone accessible</li>
          </ol>
        </div>
      </motion.div>
    );
  }

  if (riskLevel === RiskLevel.MEDIUM) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-950/50 border border-amber-500/50 p-6 rounded-xl text-amber-100 space-y-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-500 font-bold text-xl">
            <AlertTriangle className="w-7 h-7" />
            <span>⚠️ WARNING: {situationType.toUpperCase()}</span>
          </div>
          {isNightRisk && (
            <div className="flex items-center gap-1 bg-amber-900/50 px-2 py-1 rounded border border-amber-500/50 text-xs font-bold text-amber-400">
              <Moon className="w-3 h-3" />
              <span>NIGHT</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono bg-black/20 p-3 rounded-lg border border-amber-900/30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>📊 Risk Score: {riskScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>🧠 Emotion: {emotion}</span>
          </div>
        </div>

        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/10 space-y-2">
          <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
            <Navigation className="w-3 h-3" /> Suggested Direction
          </h4>
          <p className="text-sm">{escapeDirection}</p>
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-amber-400">Suggested Actions:</h3>
          <ul className="list-disc list-inside space-y-1 text-amber-200/80">
            <li>{nearestCrowdedArea}</li>
            <li>Avoid isolated or dark areas</li>
            <li>Inform a trusted friend or family member</li>
            <li>Keep emergency contacts ready</li>
            <li>Stay connected on phone</li>
          </ul>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-emerald-950/30 border border-emerald-500/30 p-5 rounded-xl text-emerald-100 space-y-3 shadow-md"
    >
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-emerald-500" />
        <div>
          <p className="font-bold text-lg">✅ You are safe</p>
          <p className="text-sm text-emerald-400/80 font-mono">📊 Risk Score: {riskScore}% | 🧠 Emotion: {emotion}</p>
        </div>
      </div>
      <div className="border-t border-emerald-900/30 pt-2">
        <p className="text-emerald-200/70 italic">Stay aware and take care 😊</p>
      </div>
    </motion.div>
  );
}
