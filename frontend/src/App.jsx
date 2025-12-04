import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://127.0.0.1:8000";
const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  const colors = {
    success: "bg-green-500/20 border-green-500/50 text-green-400",
    error: "bg-red-500/20 border-red-500/50 text-red-400",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  };

  return (
    <div
      className={`fixed top-20 right-4 sm:right-8 z-50 px-6 py-4 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-in ${colors[type]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <span className="font-bold text-sm">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function SkeletonLoader({ className = "" }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-1/2"></div>
    </div>
  );
}

// Circular Score Gauge Component
function CircularScoreGauge({ score, gradient, color }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90 w-48 h-48">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {score}
          </div>
          <div className="text-sm text-gray-400 font-bold">/ 100</div>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip Component for Pie Chart
const CustomPieTooltip = ({ active, payload, total }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data.value || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    
    return (
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          border: "2px solid rgba(139, 92, 246, 0.5)",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 92, 246, 0.3)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "700",
          zIndex: 9999,
          pointerEvents: "none",
          backdropFilter: "blur(10px)",
          minWidth: "150px",
        }}
      >
        <div style={{ marginBottom: "8px", color: "#8B5CF6", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "800" }}>
          {data.name || "Category"}
        </div>
        <div style={{ fontSize: "18px", fontWeight: "900", color: "#fff", marginBottom: "4px" }}>
          ₹{value.toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: "11px", color: "#9CA3AF", opacity: 0.9 }}>
          {percentage}% of total
        </div>
      </div>
    );
  }
  return null;
};

// Bar Chart Icon Component
function BarChartIcon({ className = "w-16 h-16" }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with subtle glow */}
      <circle cx="40" cy="40" r="38" fill="rgba(139, 92, 246, 0.1)" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" />
      
      {/* Grid lines */}
      <line x1="20" y1="25" x2="20" y2="65" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
      <line x1="20" y1="65" x2="60" y2="65" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
      
      {/* Bar 1 - Green (medium height) */}
      <rect
        x="25"
        y="45"
        width="10"
        height="20"
        rx="2"
        fill="url(#barGradient1)"
        className="animate-pulse"
        style={{ animationDelay: "0s" }}
      />
      
      {/* Bar 2 - Pink (shorter) */}
      <rect
        x="38"
        y="55"
        width="10"
        height="10"
        rx="2"
        fill="url(#barGradient2)"
        className="animate-pulse"
        style={{ animationDelay: "0.2s" }}
      />
      
      {/* Bar 3 - Blue (taller) */}
      <rect
        x="51"
        y="35"
        width="10"
        height="30"
        rx="2"
        fill="url(#barGradient3)"
        className="animate-pulse"
        style={{ animationDelay: "0.4s" }}
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#059669" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#DB2777" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="barGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function App() {
  const [smsText, setSmsText] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [activeTab, setActiveTab] = useState("Bank SMS");
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [adviceTab, setAdviceTab] = useState("loan");
  const [logoError, setLogoError] = useState(false);

  // Smooth score animation
  useEffect(() => {
    if (scoreData?.score !== undefined) {
      const targetScore = scoreData.score;
      const duration = 1500;
      const steps = 50;
      const increment = targetScore / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [scoreData?.score]);

  // Auto-select first available advice tab when advice data loads
  useEffect(() => {
    if (scoreData?.advice) {
      if (scoreData.advice.loan) {
        setAdviceTab("loan");
      } else if (scoreData.advice.sip) {
        setAdviceTab("sip");
      } else if (scoreData.advice.tips && scoreData.advice.tips.length > 0) {
        setAdviceTab("tips");
      }
    }
  }, [scoreData?.advice]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (smsText.trim()) {
          handleScore();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        if (smsText.trim()) {
          handleParse();
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [smsText]);

  const callApi = async (endpoint, onSuccess) => {
    if (!smsText.trim()) {
      setError("Please paste SMS / statement text first.");
      setToast({ message: "Please paste SMS / statement text first.", type: "error" });
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: smsText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      onSuccess(data);
      setToast({
        message: endpoint === "parse" ? `Successfully parsed ${data.transactions?.length || 0} transactions!` : "Score calculated successfully!",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      const msg =
        e.message === "Failed to fetch"
          ? "Cannot reach backend. Check if FastAPI is running & CORS enabled."
          : `${endpoint} failed: ${e.message}`;
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleParse = () => {
    callApi("parse", (data) => {
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    });
  };

  const handleScore = () => {
    callApi("score", (data) => {
      const txns = Array.isArray(data.transactions) ? data.transactions : [];
      setTransactions(txns);
      setScoreData(data || null);
    });
  };

  function loadSample(which = 1) {
    const s1 =
      "SBIN: Rs.500.00 debited on 21/11/2025 at ATM. Your balance is Rs.1500.00\nHDFC: Your account credited with INR 12000 on 01-Nov-2025. Salary received.";
    const s2 =
      "UPI: Rs.200 paid to Flipkart on 02-Nov-2025\nAXIS: Rs.150.00 debited for electricity bill on 05-Nov-2025\nYour EMI of Rs.3000 is debited on 10-Nov-2025";
    const s3 =
      "Salary credited: INR 25000 on 01-Dec-2025\nGroceries paid Rs.1200 via UPI\nLoan EMI Rs.2500 debited";

    const samples = { 1: s1, 2: s2, 3: s3 };
    setSmsText(samples[which]);
    setToast({ message: `Sample ${which} loaded!`, type: "info" });
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(smsText);
      setCopied(true);
      setToast({ message: "Copied to clipboard!", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setToast({ message: "Failed to copy", type: "error" });
    }
  };

  const clearText = () => {
    setSmsText("");
    setTransactions([]);
    setScoreData(null);
    setToast({ message: "Cleared!", type: "info" });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal, bVal;
    
    if (sortConfig.key === "amount") {
      aVal = Number(a.amount) || 0;
      bVal = Number(b.amount) || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    } else if (sortConfig.key === "type") {
      aVal = a.type || "";
      bVal = b.type || "";
    } else if (sortConfig.key === "category") {
      aVal = a.category || "";
      bVal = b.category || "";
    } else if (sortConfig.key === "date") {
      aVal = a.date || "";
      bVal = b.date || "";
    } else {
      return 0;
    }
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  // Charts data
  const categorySummary = transactions.reduce((acc, t) => {
    const cat = (t && (t.category || t.type)) || "other";
    const amt = Number(t && t.amount) || 0;
    acc[cat] = (acc[cat] || 0) + amt;
    return acc;
  }, {});
  const pieData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value,
  }));
  const pieTotal = pieData.reduce((sum, item) => sum + (item.value || 0), 0);

  const lineData = [];
  if (scoreData && scoreData.metrics) {
    lineData.push({ name: "Income", value: scoreData.metrics.income || 0 });
    lineData.push({ name: "Expense", value: scoreData.metrics.expense || 0 });
    lineData.push({ name: "EMI", value: scoreData.metrics.emi || 0 });
  }

  const displayScore = scoreData ? animatedScore : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#8B5CF6";
    if (score >= 40) return "#F59E0B";
    return "#EC4899";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-green-400 to-emerald-500";
    if (score >= 60) return "from-purple-500 to-pink-500";
    if (score >= 40) return "from-yellow-400 to-orange-500";
    return "from-pink-500 to-red-500";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const charCount = smsText.length;
  const maxChars = 5000;
  const charPercentage = (charCount / maxChars) * 100;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="relative z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-20 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                {logoError ? (
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/50">
                    💳
                  </div>
                ) : (
                  <img 
                    src="/logo.png" 
                    alt="Kredita Logo" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.02em", background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #fce7f3 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Smart Credit Analyzer
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1 flex items-center gap-1.5">
                  Transform SMS & statements into credit insights <span className="text-base">💡</span>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block px-4 py-2 bg-white/5 rounded-full text-xs sm:text-sm font-bold text-gray-300 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                API: {API_BASE}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="mb-8 sm:mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-fade-in" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.03em" }}>
            Smart Credit Analyzer
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-medium px-4 mb-6 flex items-center justify-center gap-2">
            Transform SMS & statements into credit insights <span className="text-2xl">💡</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 px-4">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Easy Integration
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></span>
              Powerful Dashboard
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></span>
              Real-time Analysis
            </span>
          </div>
        </section>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-400 text-sm font-semibold">
                <span className="text-lg">⚠️</span>
                <span><strong>Error: </strong>{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* SMS Input Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Paste SMS / UPI Messages
                  </h3>
                </div>
                {smsText && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs"
                      title="Copy to clipboard"
                    >
                      {copied ? "✓" : "📋"}
                    </button>
                    <button
                      onClick={clearText}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs"
                      title="Clear"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 font-medium mb-4">Enter transaction messages to analyze credit health</p>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["Bank SMS", "UPI", "Wallet", "EMI"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/50 scale-105"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-105"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Textarea with Character Counter */}
              <div className="relative">
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 resize-none font-mono text-white placeholder-gray-500 hover:bg-white/10 pr-20"
                  placeholder="Paste your bank SMS or UPI messages here..."
                  value={smsText}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setSmsText(e.target.value);
                    }
                  }}
                  rows={8}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <div className={`text-xs font-medium ${charPercentage > 90 ? "text-red-400" : charPercentage > 70 ? "text-yellow-400" : "text-gray-500"}`}>
                    {charCount}/{maxChars}
                  </div>
                  {charPercentage > 90 && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Supported Formats */}
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-xs font-bold text-gray-400 mb-2">Supported formats:</p>
                <div className="space-y-1 text-xs text-gray-500 font-mono">
                  <div className="hover:text-gray-400 transition-colors">• SBIN: Rs.500.00 debited on 21/11/2025 at ATM</div>
                  <div className="hover:text-gray-400 transition-colors">• HDFC: Your account credited with INR 12000</div>
                  <div className="hover:text-gray-400 transition-colors">• UPI: Rs.200 paid to Amazon via GPay</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6">
                <button
                  onClick={handleParse}
                  disabled={loading || !smsText.trim()}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gray-800/80 text-white border border-gray-700/50 shadow-lg hover:bg-gray-700/80 hover:border-gray-600/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2 relative group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Parse</span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ctrl/Cmd + P
                      </span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleScore}
                  disabled={loading || !smsText.trim()}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center gap-2 relative group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Calculate Score</span>
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ctrl/Cmd + Enter
                      </span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-500 font-medium">Try samples:</span>
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => loadSample(num)}
                      className="px-3 py-2 rounded-lg font-bold text-xs bg-white/5 text-white/80 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 hover:scale-110"
                    >
                      #{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">ℹ️</span>
                <h4 className="text-lg sm:text-xl font-black text-white">Quick Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2 hover:text-white transition-colors">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Paste multiple SMS messages, each on a new line</span>
                </li>
                <li className="flex items-start gap-2 hover:text-white transition-colors">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Works with most Indian bank formats (SBI, HDFC, ICICI, Axis, etc.)</span>
                </li>
                <li className="flex items-start gap-2 hover:text-white transition-colors">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Include salary credits, debits, EMIs, and UPI payments for best results</span>
                </li>
              </ul>
            </div>

            {/* Transactions Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Parsed Transactions
                </h3>
                {transactions.length > 0 && (
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-black border border-purple-500/30 backdrop-blur-sm">
                    {transactions.length} {transactions.length === 1 ? "item" : "items"}
                  </div>
                )}
              </div>
              {loading && transactions.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <SkeletonLoader key={i} />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-8xl mb-6 animate-bounce">📭</div>
                  <p className="text-base font-bold mb-2">No transactions yet.</p>
                  <p className="text-sm">Click "Parse Transactions" after pasting SMS or statement text.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">#</th>
                        <th
                          onClick={() => handleSort("type")}
                          className="px-4 sm:px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white hover:bg-white/5 transition-all rounded-t-lg"
                        >
                          <div className="flex items-center gap-2">
                            Type
                            {sortConfig.key === "type" && (
                              <span className="text-purple-400">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("category")}
                          className="px-4 sm:px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            Category
                            {sortConfig.key === "category" && (
                              <span className="text-purple-400">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("amount")}
                          className="px-4 sm:px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            Amount
                            {sortConfig.key === "amount" && (
                              <span className="text-purple-400">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("date")}
                          className="px-4 sm:px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {sortConfig.key === "date" && (
                              <span className="text-purple-400">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedTransactions.map((t, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-white/5 transition-all duration-200 cursor-pointer active:bg-white/10 group"
                        >
                          <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-400">{idx + 1}</td>
                          <td className="px-4 sm:px-6 py-4">
                            <span
                              className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black rounded-lg transition-all group-hover:scale-105 ${
                                t.type === "credit"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-black rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all group-hover:scale-105">
                              {t.category || "-"}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div
                              className={`font-black text-base sm:text-lg transition-all group-hover:scale-105 ${
                                t.type === "credit" ? "text-green-400" : "text-pink-400"
                              }`}
                            >
                              {t.type === "credit" ? "+" : "-"}₹{t.amount?.toLocaleString("en-IN") || 0}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-400">{t.date || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 sm:space-y-8">
            {/* Credit Health Score Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Credit Health Score
                </h3>
              </div>
              <p className="text-xs text-purple-400 font-medium mb-6">Smart financial analysis</p>
              {loading && !scoreData ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                    <BarChartIcon className="w-12 h-12" />
                  </div>
                  <SkeletonLoader className="w-32 mx-auto" />
                </div>
              ) : scoreData ? (
                <>
                  <div className="text-center mb-8">
                    <CircularScoreGauge
                      score={displayScore}
                      gradient={getScoreGradient(displayScore)}
                      color={getScoreColor(displayScore)}
                    />
                    <div
                      className="mt-4 text-lg sm:text-xl font-black"
                      style={{ color: getScoreColor(displayScore) }}
                    >
                      {getScoreLabel(displayScore)}
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="w-full bg-white/10 rounded-full h-3 sm:h-4 overflow-hidden backdrop-blur-sm shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(displayScore)} transition-all duration-1000 ease-out shadow-lg`}
                        style={{ width: `${Math.max(0, Math.min(100, displayScore))}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/30 hover:bg-green-500/15 hover:border-green-500/50 transition-all cursor-pointer backdrop-blur-sm group hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
                        <span className="text-sm font-black text-gray-300 uppercase tracking-wider">Income</span>
                      </div>
                      <span className="text-lg font-black text-green-400">₹{scoreData.metrics?.income?.toLocaleString("en-IN") || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-pink-500/10 rounded-xl border border-pink-500/30 hover:bg-pink-500/15 hover:border-pink-500/50 transition-all cursor-pointer backdrop-blur-sm group hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">💸</span>
                        <span className="text-sm font-black text-gray-300 uppercase tracking-wider">Expenses</span>
                      </div>
                      <span className="text-lg font-black text-pink-400">₹{scoreData.metrics?.expense?.toLocaleString("en-IN") || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/15 hover:border-yellow-500/50 transition-all cursor-pointer backdrop-blur-sm group hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🏦</span>
                        <span className="text-sm font-black text-gray-300 uppercase tracking-wider">EMI</span>
                      </div>
                      <span className="text-lg font-black text-yellow-400">₹{scoreData.metrics?.emi?.toLocaleString("en-IN") || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 hover:bg-blue-500/15 hover:border-blue-500/50 transition-all cursor-pointer backdrop-blur-sm group hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">💵</span>
                        <span className="text-sm font-black text-gray-300 uppercase tracking-wider">Savings</span>
                      </div>
                      <span className="text-lg font-black text-blue-400">₹{scoreData.metrics?.savings?.toLocaleString("en-IN") || 0}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:border-purple-500/30 transition-all group">
                    <BarChartIcon className="w-12 h-12 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm font-bold">Run scoring to see metrics</p>
                </div>
              )}
            </div>

            {/* Unified Recommendations & Advice Card with Tabs */}
            {scoreData?.advice && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Recommendations & Advice
              </h3>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
                  {scoreData.advice.loan && (
                    <button
                      onClick={() => setAdviceTab("loan")}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                        adviceTab === "loan"
                          ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20 scale-105"
                          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-105"
                      }`}
                    >
                      🏦 Loan
                    </button>
                  )}
                  {scoreData.advice.sip && (
                    <button
                      onClick={() => setAdviceTab("sip")}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                        adviceTab === "sip"
                          ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20 scale-105"
                          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-105"
                      }`}
                    >
                      📈 SIP
                    </button>
                  )}
                  {scoreData.advice.tips && scoreData.advice.tips.length > 0 && (
                    <button
                      onClick={() => setAdviceTab("tips")}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                        adviceTab === "tips"
                          ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-white border border-yellow-500/50 shadow-lg shadow-yellow-500/20 scale-105"
                          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-105"
                      }`}
                    >
                      💡 Tips
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                  {/* Loan Tab */}
                  {adviceTab === "loan" && scoreData.advice.loan && (
                    <div className="animate-fade-in">
                      {scoreData.advice.loan.can_take_loan ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-green-400 text-xl">✓</span>
                              <span className="text-base font-black text-green-400">You can take a new loan</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{scoreData.advice.loan.reason}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Suggested New EMI</div>
                                <div className="text-2xl font-black text-green-400">₹{scoreData.advice.loan.suggested_new_emi?.toLocaleString("en-IN") || 0}</div>
                              </div>
                              {scoreData.advice.loan.approx_loan_amounts && scoreData.advice.loan.approx_loan_amounts.length > 0 && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                  <div className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-wider">Loan Options</div>
                                  <div className="space-y-2">
                                    {scoreData.advice.loan.approx_loan_amounts.slice(0, 2).map((option, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                                        <span className="text-xs text-gray-400 font-bold">{option.tenure_years} years</span>
                                        <span className="text-sm text-blue-400 font-black">₹{(option.approx_loan_amount / 1000).toFixed(0)}k</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            {scoreData.advice.loan.approx_loan_amounts && scoreData.advice.loan.approx_loan_amounts.length > 2 && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-wider">All Tenure Options</div>
                                <div className="grid grid-cols-3 gap-2">
                                  {scoreData.advice.loan.approx_loan_amounts.map((option, idx) => (
                                    <div key={idx} className="p-2.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-center">
                                      <div className="text-xs text-gray-400 mb-1 font-bold">{option.tenure_years}y</div>
                                      <div className="text-xs text-blue-400 font-black">₹{(option.approx_loan_amount / 1000).toFixed(0)}k</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 bg-red-500/10 rounded-xl border border-red-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-400 text-xl">⚠</span>
                            <span className="text-base font-black text-red-400">Not recommended at this time</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{scoreData.advice.loan.reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SIP Tab */}
                  {adviceTab === "sip" && scoreData.advice.sip && (
                    <div className="animate-fade-in">
                      {scoreData.advice.sip.should_invest ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-green-400 text-xl">✓</span>
                              <span className="text-base font-black text-green-400">Start investing in SIP</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{scoreData.advice.sip.reason}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Suggested SIP Amount</div>
                                <div className="text-2xl font-black text-purple-400">₹{scoreData.advice.sip.suggested_sip?.toLocaleString("en-IN") || 0}</div>
                              </div>
                              {scoreData.advice.sip.risk_profile && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                  <div className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-wider">Risk Profile</div>
                                  <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap w-full sm:w-auto ${
                                    scoreData.advice.sip.risk_profile === "aggressive" 
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : scoreData.advice.sip.risk_profile === "balanced"
                                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  }`}>
                                    {scoreData.advice.sip.risk_profile.toUpperCase()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-400 text-xl">ℹ</span>
                            <span className="text-base font-black text-yellow-400">Not recommended yet</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{scoreData.advice.sip.reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tips Tab */}
                  {adviceTab === "tips" && scoreData.advice.tips && scoreData.advice.tips.length > 0 && (
                    <div className="animate-fade-in">
                      <ul className="space-y-3">
                        {scoreData.advice.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group cursor-pointer">
                            <span className="text-purple-400 mt-0.5 text-xl flex-shrink-0 group-hover:scale-110 transition-transform">💡</span>
                            <span className="text-sm text-gray-300 flex-1 leading-relaxed group-hover:text-white transition-colors font-medium">{tip}</span>
                  </li>
                        ))}
                </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compact Insights Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">📊</span>
                <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Key Insights
                </h3>
              </div>
              {scoreData ? (
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Current Savings</div>
                    <div className="text-2xl font-black text-blue-400 group-hover:scale-105 transition-transform">₹{scoreData.metrics?.savings?.toLocaleString("en-IN") || 0}</div>
                  </div>
                  {scoreData.metrics?.dti !== null && scoreData.metrics?.dti !== undefined && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Debt-to-Income Ratio</div>
                      <div className="text-2xl font-black text-purple-400 group-hover:scale-105 transition-transform">{(scoreData.metrics.dti * 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {scoreData.metrics?.savings_rate !== null && scoreData.metrics?.savings_rate !== undefined && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Savings Rate</div>
                      <div className="text-2xl font-black text-green-400 group-hover:scale-105 transition-transform">{(scoreData.metrics.savings_rate * 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3 opacity-50">📊</div>
                  <p className="text-gray-500 text-sm font-medium">Run a score calculation to see insights.</p>
                </div>
              )}
            </div>

            {/* Category Breakdown Chart - Separate Card */}
            {pieData.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📊</span>
                  <h4 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Category Breakdown
                </h4>
                </div>
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        innerRadius={65}
                        paddingAngle={3}
                        animationDuration={800}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={(props) => <CustomPieTooltip {...props} total={pieTotal} />}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", fontWeight: "700", color: "#fff", paddingTop: "20px" }}
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Metric Trend Chart - Separate Card */}
            {lineData.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📈</span>
                  <h4 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Metric Trend
                </h4>
                </div>
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart data={lineData} margin={{ top: 15, right: 25, left: 15, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255, 255, 255, 0.6)"
                        style={{ fontSize: "12px", fontWeight: "700" }}
                        tick={{ fill: "rgba(255, 255, 255, 0.8)" }}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.6)" 
                        style={{ fontSize: "12px", fontWeight: "700" }}
                        tick={{ fill: "rgba(255, 255, 255, 0.8)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.95)",
                          border: "2px solid rgba(139, 92, 246, 0.5)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 92, 246, 0.3)",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "700",
                          padding: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        strokeWidth={4}
                        dot={{ fill: "#8B5CF6", r: 6, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8, strokeWidth: 3, stroke: "#fff" }}
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        /* Ensure Recharts tooltip is visible */
        .recharts-tooltip-wrapper {
          z-index: 9999 !important;
        }
        .recharts-default-tooltip {
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
}
