
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
    description: "Try contract analysis for free.",
    features: [
      "1 contract analysis",
      "Red flag detection",
      "Download summary report"
    ],
    notIncluded: [
      "Improvement suggestions",
      "Side-by-side comparison",
      "Advanced clause explanations",
      "Auto NDA & Agreement Generator",
      "Legal Advice Chat",
      "Email Dispute Response",
      "Jurisdiction-Based Suggestions",
      "Downloadable improvements"
    ],
    documentCount: 1,
  },
  {
    id: "basic",
    name: "Basic",
    price: "$9.99",
    description: "Perfect for regular contract reviews.",
    features: [
      "10 contract analyses per month",
      "Red flag detection",
      "Improvement suggestions",
      "Side-by-side comparison",
      "Advanced clause explanations",
      "Downloadable improvements",
      "Download summary report"
    ],
    notIncluded: [
      "Auto NDA & Agreement Generator",
      "Legal Advice Chat", 
      "Email Dispute Response",
      "Jurisdiction-Based Suggestions"
    ],
    documentCount: 10,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29.99",
    description: "Complete AI legal suite access.",
    features: [
      "Unlimited contract analysis",
      "Red flag detection",
      "Improvement suggestions",
      "Side-by-side comparison",
      "Advanced clause explanations",
      "Downloadable improvements",
      "Download summary report",
      "Auto NDA & Agreement Generator",
      "Legal Advice Chat",
      "Email Dispute Response",
      "Jurisdiction-Based Suggestions"
    ],
    highlight: true,
    documentCount: "unlimited",
  },
];

export default PLANS;
