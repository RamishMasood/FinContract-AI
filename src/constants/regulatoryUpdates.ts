// Regulatory Radar - Evolving regulatory updates for compliance tracking
// Simulates regulatory change feed (in production, would integrate with regulatory APIs/news)

export interface RegulatoryUpdate {
  id: string;
  date: string;
  regulation: string;
  jurisdiction: string;
  title: string;
  summary: string;
  impactAreas: string[];
  effectiveDate: string;
  affectedContractTypes: string[];
  suggestedActions: string[];
}

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    id: "mifid-2026-01",
    date: "2026-01-15",
    regulation: "MiFID II",
    jurisdiction: "EU",
    title: "ESMA amends leverage limits for retail CFDs",
    summary: "ESMA has adopted stricter leverage limits for retail clients: max 1:30 for major forex pairs, 1:20 for non-major forex and gold, 1:10 for indices, 1:5 for cryptocurrencies. Negative balance protection now mandatory for all EU brokers.",
    impactAreas: ["Leverage & Margin", "Negative Balance Protection", "Client Categorization"],
    effectiveDate: "2026-03-01",
    affectedContractTypes: ["cfd", "client-agreement"],
    suggestedActions: ["Review leverage disclosure clauses", "Add negative balance protection clause", "Update risk warnings for retail clients"]
  },
  {
    id: "fca-2026-01",
    date: "2026-01-08",
    regulation: "UK FCA",
    jurisdiction: "UK",
    title: "FCA product intervention: CFD disclosure requirements",
    summary: "FCA requires enhanced disclosure of the percentage of retail client accounts that lose money when trading CFDs. Must be displayed prominently in client agreements and on platforms.",
    impactAreas: ["Risk Disclosure", "Client Agreement", "Marketing"],
    effectiveDate: "2026-04-01",
    affectedContractTypes: ["cfd", "client-agreement"],
    suggestedActions: ["Add retail loss percentage disclosure", "Update risk warning templates", "Review suitability assessment wording"]
  },
  {
    id: "uae-sca-2025-12",
    date: "2025-12-20",
    regulation: "UAE SCA",
    jurisdiction: "UAE",
    title: "SCA updates suitability and appropriateness requirements",
    summary: "UAE SCA has revised rules on suitability assessments for derivatives. Brokers must document client's knowledge and experience. Simplified appropriateness test for non-advised services.",
    impactAreas: ["Suitability", "KYC/AML", "Client Onboarding"],
    effectiveDate: "2026-02-15",
    affectedContractTypes: ["cfd", "client-agreement", "isda"],
    suggestedActions: ["Add suitability questionnaire reference", "Document knowledge/experience checks", "Review client categorization flow"]
  },
  {
    id: "cftc-2025-12",
    date: "2025-12-10",
    regulation: "US CFTC",
    jurisdiction: "US",
    title: "CFTC margin rules for uncleared swaps",
    summary: "CFTC has finalized margin requirements for uncleared swaps. Phase-in continues for smaller counterparties. Initial margin and variation margin documentation must be updated.",
    impactAreas: ["Margin", "ISDA", "Counterparty Risk"],
    effectiveDate: "2026-06-01",
    affectedContractTypes: ["isda"],
    suggestedActions: ["Review ISDA margin annex", "Update credit support documentation", "Verify counterparty classification"]
  },
  {
    id: "malta-mfsa-2026-01",
    date: "2026-01-22",
    regulation: "Malta MFSA",
    jurisdiction: "Malta",
    title: "MFSA guidance on unilateral position closure",
    summary: "MFSA issued guidance limiting broker's ability to close positions without notice. Advance notice of at least 24 hours required except in extreme volatility. Must be clearly disclosed in client agreement.",
    impactAreas: ["Position Closure", "Broker Powers", "Margin Call Procedures"],
    effectiveDate: "2026-05-01",
    affectedContractTypes: ["cfd", "client-agreement"],
    suggestedActions: ["Add 24-hour notice requirement for non-emergency closure", "Define 'extreme volatility' threshold", "Update margin call procedure disclosure"]
  }
];

export const getUpdatesForJurisdiction = (jurisdiction: string): RegulatoryUpdate[] =>
  REGULATORY_UPDATES.filter(
    (u) =>
      u.jurisdiction.toLowerCase() === jurisdiction.toLowerCase() ||
      jurisdiction.toLowerCase() === "all"
  );
