
import { Brain } from "lucide-react";
import * as React from "react";

export default function HeroLogo() {
  // State to trigger checkmark after animation
  const [approved, setApproved] = React.useState(false);

  // Triggers the check after 1.25s (when scan is mostly done)
  React.useEffect(() => {
    const timer = setTimeout(() => setApproved(true), 1250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-white/50 shadow-none p-4 relative select-none"
      style={{ width: 82, height: 82, minWidth: 82, minHeight: 82 }}
    >
      {/* Document SVG */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow"
        style={{ zIndex: 1 }}
      >
        {/* Paper outline */}
        <rect
          x="7"
          y="9"
          width="38"
          height="38"
          rx="6"
          fill="#f0f9ff"
          stroke="#1e3a5f"
          strokeWidth="2.4"
        />
        {/* Writing lines */}
        <rect x="13" y="18" width="20" height="2.5" rx="1.2" fill="#2563eb" opacity="0.32" />
        <rect x="13" y="25" width="24" height="2.5" rx="1.2" fill="#2563eb" opacity="0.22" />
        <rect x="13" y="32" width="12" height="2.5" rx="1.2" fill="#059669" opacity="0.25" />
        {/* SCAN LINE: animated gradient sweep down */}
        <AnimatedScan />
      </svg>
      {/* Animated brain (AI) */}
      <span
        className="absolute left-[65%] top-[21%] -translate-x-1/2 -translate-y-1/2"
        style={{
          zIndex: 3,
          filter: "drop-shadow(0px 0px 10px #1e3a5f66)",
          animation: "pulse 2s infinite"
        }}
      >
        <Brain
          className="h-7 w-7"
          strokeWidth={2.2}
          style={{
            color: "#1e3a5f",
            transition: "transform 0.14s",
            animation: "pulse-brain 2.1s infinite"
          }}
        />
      </span>
      {/* Animated checkmark (approved) */}
      <span
        className={`absolute bottom-2 right-2 transition-all duration-500 ${
          approved
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75"
        }`}
        style={{ zIndex: 5 }}
      >
        <svg width="21" height="21" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="8" fill="#ecfdf5" />
          <path
            d="M5 8.5l2 2 4-4"
            stroke="#059669"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {/* CSS: pulse for brain */}
      <style>
        {`
        @keyframes scan-move {
          0% { transform: translateY(-17px); opacity: 0.9; }
          10% { opacity: 1; }
          65% { opacity: 0.9; }
          80% { opacity: 0.2; }
          100% { transform: translateY(22px); opacity: 0.03;}
        }
        @keyframes pulse-brain {
          0%, 100% { transform: scale(1);}
          30% { transform: scale(1.12);}
          60% { transform: scale(1);}
        }
        `}
      </style>
    </span>
  );
}

function AnimatedScan() {
  // Animates a thin gradient "scan" line from top to bottom
  return (
    <g>
      {/* The glowing animated scan bar */}
      <rect
        x="9.5"
        y="14"
        width="33"
        height="5"
        rx="2"
        fill="url(#scan-gradient)"
        style={{
          filter: "blur(1.2px)",
          opacity: 0.89,
          animation: "scan-move 1.18s cubic-bezier(.44,.91,.47,1) both"
        }}
      />
      {/* SVG gradient definition for blue-purple glow */}
      <defs>
        <linearGradient id="scan-gradient" x1="0" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93c5fd" />
          <stop offset="0.50" stopColor="#2563eb" />
          <stop offset="0.99" stopColor="#059669" />
        </linearGradient>
      </defs>
    </g>
  );
}
