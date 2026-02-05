import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object | object[];
  noIndex?: boolean;
  additionalMeta?: Array<{ name?: string; property?: string; content: string }>;
}

const SITE_NAME = "FinContract AI";
const SITE_URL = "https://fincontract.ai";

const SEOHead = ({
  title = "FinContract AI – AI for Trading Contract Compliance & Risk Analysis | Deriv Hackathon",
  description = "Automate risk detection and compliance in CFDs, futures, and trading agreements with FinContract AI. Instant red flags, suggestions, and regulatory checks for finance teams.",
  keywords = [
    "FinContract AI",
    "FinContractAI",
    "fincontract.ai",
    "trading contract compliance",
    "CFD risk analysis",
    "futures compliance",
    "FCA CFTC Malta",
    "finance contract AI",
    "broker compliance",
    "anti-fraud contracts",
    "Deriv hackathon",
    "contract risk",
    "regulatory compliance"
  ].join(", "),
  canonicalUrl,
  ogImage = `${SITE_URL}/opengraph-image.png`,
  ogType = "website",
  structuredData,
  noIndex = false,
  additionalMeta = []
}: SEOHeadProps) => {
  const fullTitle = title.includes("FinContract AI") ? title : `${title} | FinContract AI`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const siteUrl = (canonicalUrl || SITE_URL).replace(/\/$/, '');

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "alternateName": ["FinContractAI", "FinContract A I"],
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.png`,
    "sameAs": ["https://x.com/FinContractAI"]
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": siteUrl
  };
  const jsonLdPayloads: object[] = [organizationJsonLd, websiteJsonLd].concat(
    structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : []
  );
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1e3a5f" />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <link rel="alternate" href={currentUrl} hrefLang="x-default" />
      <link rel="alternate" href={currentUrl} hrefLang="en" />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${title} - ${SITE_NAME}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@FinContractAI" />
      <meta name="twitter:creator" content="@FinContractAI" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${title} - ${SITE_NAME}`} />
      
      {additionalMeta.map((meta, index) => (
        <meta 
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content} 
        />
      ))}
      
      {jsonLdPayloads.map((payload, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(payload)}
        </script>
      ))}
      
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.gpteng.co" />
      <link rel="dns-prefetch" href={`//${new URL(SITE_URL).host}`} />
    </Helmet>
  );
};

export default SEOHead;
