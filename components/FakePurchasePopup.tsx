import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";

const PRODUCTS = [
  { name: "Complete AI Legal Suite Access.", plan: "Premium" },
  { name: "10 Complete Contract Analysis", plan: "Basic" },
  { name: "Unlimited Documents Analysis", plan: "Premium" },
  { name: "AI Legal Assistant", plan: "Premium" },
];

const DELAYS = [5000, 10000, 20000, 30000]; // ms

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTime() {
  return getRandomItem(DELAYS);
}

function getRandomProduct() {
  return getRandomItem(PRODUCTS);
}

function getRandomTimeString() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export const FakePurchasePopup = () => {
  const [visible, setVisible] = useState(false);
  const [product, setProduct] = useState(getRandomProduct());
  const [time, setTime] = useState(getRandomTimeString());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showPopup = () => {
    setProduct(getRandomProduct());
    setTime(getRandomTimeString());
    setVisible(true);
    // Hide after 4 seconds
    timeoutRef.current = setTimeout(() => setVisible(false), 4000);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const scheduleNext = () => {
      timer = setTimeout(() => {
        showPopup();
        scheduleNext();
      }, getRandomTime());
    };
    scheduleNext();
    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        zIndex: 9999,
        minWidth: 280,
        maxWidth: 340,
        pointerEvents: "none",
      }}
    >
      <div
        className={`transition-all duration-500 ease-in-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <div className="bg-white/95 border border-purple-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              {time} – Someone just bought
            </div>
            <div className="font-bold text-purple-900">{product.name}</div>
            <div className="text-xs text-purple-600">{product.plan} Plan</div>
          </div>
          <button
            className="ml-2 text-gray-400 hover:text-gray-600 text-xs"
            aria-label="Close"
            onClick={() => setVisible(false)}
            style={{ pointerEvents: "auto" }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
