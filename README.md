# FinContract AI

**Next-Gen AI Legal Compliance & Risk Management Platform for Finance**

FinContract AI is a comprehensive legal-tech solution designed for brokers, fintechs, and traders. It leverages advanced AI to automate contract analysis, monitor regulatory changes in real-time, and generate compliant legal documents instantly.

## 🚀 Key Features

### 1. 🛡️ AI Contract Risk Scanner
**URL**: `/dashboard/upload`
Instantly audit your trading agreements (PDF/DOCX/Text).
-   **Deep Risk Detection**: Scans for 30+ toxic clauses including hidden leverage terms, unfair liquidation rules, and fraud indicators.
-   **Smart Scoring**: Generates a **Compliance Risk Score** (0-100) and highlights **Red Flags** with severity levels.
-   **Auto-Suggestions**: Provides "Safe Rewrite" suggestions for risky clauses to help you negotiate better terms.

### 2. 📡 Regulatory Radar & Impact Analyzer
**URL**: `/dashboard/regulatory-radar`
Stay ahead of global financial regulations without the manual legwork.
-   **Real-Time Tracking**: Monitors updates from major bodies like **ESMA (EU), FCA (UK), CFTC (US), MFSA (Malta)**.
-   **Auto-Impact Assessment**: Automatically cross-checks new regulations against your stored contracts to flag non-compliant documents.
-   **Actionable Insights**: Gives deadline-driven checklists to ensure continued compliance.

### 3. ✍️ Compliant Agreement Generator
**URL**: `/dashboard/agreement-generator`
Draft robust legal documents in seconds, not days.
-   **Instant Drafts**: Generates professional **NDAs, Client Agreements, and Introducing Broker (IB) Contracts**.
-   **Context-Aware**: Tailors formatting and terms based on the specific parties (e.g., "Liquidity Provider" vs "Retail Client").
-   **Export Ready**: Download as PDF or Text, or save to your secure dashboard.

### 4. ⚖️ Smart Dispute Responder
**URL**: `/dashboard/dispute-email`
Handle conflicts with confidence.
-   **AI Legal Drafting**: Generates formal, legally-grounded dispute emails for issues like **contested margin calls, frozen assets, or invoice errors**.
-   **Professional Tone**: Ensures your communications are firm, compliant, and fact-based to escalate issues effectively.

### 5. 🤖 Regulatory Risk Advisor (Legal Chat)
**URL**: `/dashboard/legal-chat`
Your 24/7 AI Compliance Consultant.
-   **Instant Answers**: Ask complex questions like *"Is 1:100 leverage allowed for retail clients in the UAE?"*
-   **Citations**: Provides jurisdiction-specific guidance referenced from official regulatory frameworks.

### 6. 🌍 Jurisdiction Explorer
**URL**: `/dashboard/jurisdiction-suggestion`
-   **Global Rules Engine**: Get instant summaries of trading rules for specific regions (Malta, UK, UAE, etc.).
-   **Compliance Check**: Verifies if your intended operations match local licensing requirements.

---

## 🛠️ Technology Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI
-   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
-   **AI Engine**: Deepseek (via Edge Functions) for legal reasoning and analysis
-   **Styling**: Modern, responsive glassmorphism design

---

## 💻 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Supabase Account (for backend connection)

### Installation

1.  **Clone the repository**
    ```sh
    git clone <YOUR_GIT_URL>
    cd FinContract-AI
    ```

2.  **Install dependencies**
    ```sh
    npm install
    # or
    bun install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Locally**
    ```sh
    npm run dev
    ```
    Access the app at `http://localhost:8080`

## 📦 Deployment

Build the optimized production bundle:
```sh
npm run build
```
Deploy the `dist` folder to any static host (Vercel, Netlify, Cloudflare Pages).

---

## 📄 License
MIT License. Free for educational and hackathon use.
