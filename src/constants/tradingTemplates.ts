// Trading contract templates for FinContract AI
// Based on Deriv Trading Terms and common finance contract patterns

export interface TradingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'cfd' | 'isda' | 'loan' | 'client-agreement';
  sampleText: string;
  riskAreas: string[];
  complianceRegs: string[];
}

export const TRADING_TEMPLATES: TradingTemplate[] = [
  {
    id: 'cfd-deriv',
    name: 'CFD Trading Agreement (Deriv-style)',
    description: 'Contract for Difference trading terms with leverage, margin, and position closure clauses',
    category: 'cfd',
    sampleText: `TRADING TERMS AND CONDITIONS

1. LEVERAGE AND MARGIN
High leverage can lead to losses exceeding your initial margin. For CFDs, leverage up to 1:1000 may apply. You must maintain minimum margin requirements at all times. If your margin falls below the maintenance level, we may close your positions without notice.

2. POSITION CLOSURE
We reserve the right to close your positions without prior notice in extreme market conditions, including but not limited to:
- Margin falling below maintenance level
- Market volatility exceeding normal parameters
- Regulatory requirements
- Force majeure events

3. RISKS
Trading CFDs involves significant risk. You may lose more than your initial investment. CFDs do not grant ownership of the underlying asset. Market volatility may cause rapid losses. Past performance does not guarantee future results.

4. SUITABILITY
By entering into this agreement, you confirm that you understand the risks involved and that trading CFDs is suitable for your investment objectives and risk tolerance.

5. REGULATORY COMPLIANCE
This agreement is governed by Malta law and complies with MiFID II requirements. Client funds are held in segregated accounts.`,
    riskAreas: ['High leverage (1:1000)', 'Unilateral position closure', 'No negative balance protection', 'Missing suitability checks'],
    complianceRegs: ['MiFID II', 'Malta MFSA', 'EU ESMA']
  },
  {
    id: 'isda-derivatives',
    name: 'ISDA Master Agreement',
    description: 'International Swaps and Derivatives Association master agreement for OTC derivatives',
    category: 'isda',
    sampleText: `ISDA MASTER AGREEMENT

This ISDA Master Agreement (this "Agreement") is entered into between the parties for the purpose of documenting OTC derivative transactions.

1. DEFINITIONS
"Derivative Transaction" means any swap, option, forward, or other derivative instrument.

2. PAYMENT OBLIGATIONS
Each party agrees to make payments as required under the terms of each Transaction. Netting provisions apply to all Transactions.

3. EVENTS OF DEFAULT
The following constitute Events of Default:
- Failure to pay any amount when due
- Breach of any representation or warranty
- Insolvency or bankruptcy

4. TERMINATION
Upon an Event of Default, the Non-Defaulting Party may terminate all Transactions and calculate amounts due.`,
    riskAreas: ['Cross-default provisions', 'Close-out netting risks', 'Credit exposure'],
    complianceRegs: ['CFTC', 'FCA', 'Dodd-Frank']
  },
  {
    id: 'client-agreement-broker',
    name: 'Client Trading Agreement',
    description: 'Standard client agreement for retail trading platforms',
    category: 'client-agreement',
    sampleText: `CLIENT TRADING AGREEMENT

1. CLIENT REPRESENTATIONS
You represent that you have the legal capacity to enter into this Agreement and that all information provided is accurate.

2. TRADING SERVICES
We provide access to trading platforms for CFDs, forex, and other financial instruments. All trades are executed on a best-efforts basis.

3. RISK DISCLOSURE
Trading involves substantial risk of loss. You may lose all or more than your initial investment. You should not trade with funds you cannot afford to lose.

4. FEES AND CHARGES
We charge spreads, commissions, and overnight financing fees as disclosed in our fee schedule.`,
    riskAreas: ['Missing KYC/AML checks', 'Unclear fee structure', 'No dispute resolution'],
    complianceRegs: ['FCA', 'CFTC', 'ASIC']
  },
  {
    id: 'loan-agreement',
    name: 'Margin Loan Agreement',
    description: 'Margin lending agreement for leveraged trading positions',
    category: 'loan',
    sampleText: `MARGIN LOAN AGREEMENT

1. LOAN AMOUNT
The Lender agrees to provide margin financing up to the agreed Loan-to-Value ratio.

2. COLLATERAL
All trading positions serve as collateral. The Lender may liquidate collateral if margin requirements are not met.

3. INTEREST AND FEES
Interest accrues daily on the outstanding loan balance at the agreed rate. Additional fees may apply for margin calls.

4. DEFAULT
Failure to meet margin calls or repay the loan constitutes default, allowing the Lender to liquidate all positions.`,
    riskAreas: ['Unilateral liquidation rights', 'High interest rates', 'Cross-collateralization'],
    complianceRegs: ['CFTC', 'FCA', 'SEC']
  }
];

// Deriv sample data extracted from trading terms
export const DERIV_SAMPLE_DATA = {
  leverageWarnings: [
    "High leverage can lead to losses exceeding your initial margin. For CFDs, leverage up to 1:1000 may apply.",
    "Leverage amplifies both profits and losses. A small adverse price movement may result in significant losses."
  ],
  positionClosure: [
    "We may close your positions without notice in extreme market conditions or if margin falls below maintenance level.",
    "We reserve the right to close positions at our discretion to manage risk exposure."
  ],
  risks: [
    "No ownership of underlying asset; market volatility may cause rapid losses.",
    "Trading involves substantial risk of loss. You may lose more than your initial investment.",
    "Past performance does not guarantee future results."
  ],
  regulatory: [
    "This agreement is governed by Malta law and complies with MiFID II requirements.",
    "Client funds are held in segregated accounts in accordance with regulatory requirements."
  ]
};

// Finance-specific risk detection patterns
export const FINANCE_RISK_PATTERNS = {
  highLeverage: {
    pattern: /leverage.*1:\d{3,}|leverage.*up to.*\d{3,}/i,
    severity: 'high' as const,
    category: 'leverage-risk'
  },
  unilateralClosure: {
    pattern: /close.*position.*without.*notice|reserve.*right.*close|may close.*position/i,
    severity: 'high' as const,
    category: 'broker-powers'
  },
  missingNegativeBalance: {
    pattern: /negative balance protection|loss.*limited.*deposit/i,
    severity: 'medium' as const,
    category: 'client-protection',
    inverse: true // Flag if NOT present
  },
  missingSuitability: {
    pattern: /suitability.*assessment|know.*customer|kyc|aml/i,
    severity: 'medium' as const,
    category: 'compliance',
    inverse: true
  },
  unlimitedLiability: {
    pattern: /unlimited.*liability|liable.*all.*losses|exceed.*initial.*investment/i,
    severity: 'high' as const,
    category: 'liability-risk'
  }
};

// Regulatory compliance rulesets
export const REGULATORY_RULESETS = {
  'malta': {
    name: 'Malta MFSA',
    requirements: ['Client fund segregation', 'MiFID II compliance', 'Negative balance protection', 'Suitability assessment'],
    applicableTo: ['CFDs', 'Forex', 'Derivatives']
  },
  'uk': {
    name: 'UK FCA',
    requirements: ['Client money rules', 'MiFID II', 'Product intervention', 'Suitability checks'],
    applicableTo: ['CFDs', 'Spread betting', 'Forex']
  },
  'us': {
    name: 'US CFTC',
    requirements: ['Segregated accounts', 'Risk disclosure', 'Suitability', 'Anti-fraud provisions'],
    applicableTo: ['Futures', 'Options', 'Swaps']
  },
  'uae': {
    name: 'UAE SCA',
    requirements: ['Client asset protection', 'Suitability assessment', 'Risk warnings'],
    applicableTo: ['Securities', 'Derivatives']
  },
  'eu': {
    name: 'EU MiFID II',
    requirements: ['Best execution', 'Client categorization', 'Suitability', 'Product governance'],
    applicableTo: ['All investment services']
  }
};
