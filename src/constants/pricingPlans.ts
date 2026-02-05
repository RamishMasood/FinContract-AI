export type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  highlight?: boolean;
  documentCount?: number | "unlimited";
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    description: "Try trading contract risk analysis for free.",
    features: [
      "1 trading contract analysis",
      "Risk & red flag detection (leverage, compliance)",
      "Download summary report"
    ],
    notIncluded: [
      "Improvement suggestions",
      "Side-by-side comparison",
      "Advanced clause explanations",
      "Compliant Agreement Generator",
      "Regulatory Risk Chat",
      "Dispute Response",
      "Jurisdiction-Specific Rules",
      "Downloadable improvements"
    ],
    documentCount: 1,
  },
  {
    id: "basic",
    name: "Basic",
    price: "$9.99",
    description: "For teams reviewing trading & finance contracts regularly.",
    features: [
      "10 contract analyses per month",
      "Risk & red flag detection",
      "Improvement suggestions",
      "Side-by-side comparison",
      "Advanced clause explanations",
      "Downloadable improvements",
      "Download summary report"
    ],
    notIncluded: [
      "Compliant Agreement Generator",
      "Regulatory Risk Chat",
      "Dispute Response",
      "Jurisdiction-Specific Rules"
    ],
    documentCount: 10,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29.99",
    description: "Full FinContract AI: compliance, risk, and regulatory tools.",
    features: [
      "Unlimited contract analysis",
      "Risk & red flag detection",
      "Improvement suggestions",
      "Side-by-side comparison",
      "Advanced clause explanations",
      "Downloadable improvements",
      "Download summary report",
      "Compliant Agreement Generator",
      "Regulatory Risk Chat",
      "Dispute Response",
      "Jurisdiction-Specific Rules"
    ],
    highlight: true,
    documentCount: "unlimited",
  },
];

export default PLANS;
