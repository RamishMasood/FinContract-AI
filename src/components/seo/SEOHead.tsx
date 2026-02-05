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

const SEOHead = ({
  title = "Legal Insight AI - Complete AI Legal Suite for Contract Analysis",
  description = "Analyze contracts, generate agreements, get legal advice, handle disputes, and receive jurisdiction-specific guidance with our comprehensive AI legal suite. Professional legal document analysis powered by artificial intelligence.",
  keywords = [
    "Legal Insight AI",
    "legal insight ai",
    "LegalInsightAI",
    "Legal Insight A I",
    "Legal AI Insight",
    "legal",
    "insight",
    "AI",
    "law",
    "lawyer",
    "AI lawyer",
    "legal assistant",
    "AI legal assistant",
    "contract analyzer",
    "contract reviewer",
    "contract analysis",
    "agreement analysis",
    "document analysis",
    "legal document review",
    "contract generator",
    "NDA generator",
    "agreement generator",
    "dispute response",
    "jurisdiction guidance",
    "legal technology",
    "legal tech",
    "contract review software",
    "AI legal tools",
    "legal automation",
    "compliance",
    "risk analysis"
  ].join(", "),
  canonicalUrl,
  ogImage = "https://legalinsightai.software/opengraph-image.png",
  ogType = "website",
  structuredData,
  noIndex = false,
  additionalMeta = []
}: SEOHeadProps) => {
  const fullTitle = title.includes("Legal Insight AI") ? title : `${title} | Legal Insight AI`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // Default JSON-LD for Organization and WebSite (with Sitelinks Search Box)
  const siteUrl = (canonicalUrl || 'https://legalinsightai.software').replace(/\/$/, '');
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Legal Insight AI",
    "alternateName": [
      "LegalInsightAI",
      "Legal Insight A I",
      "Legal AI Insight"
    ],
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.png`,
    "sameAs": [
      "https://x.com/LegalInsightAI"
    ]
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Legal Insight AI",
    "url": siteUrl
  };
  const jsonLdPayloads: object[] = [organizationJsonLd, websiteJsonLd].concat(
    structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : []
  );
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Legal Insight AI" />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#213B75" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="application-name" content="Legal Insight AI" />
      <meta name="apple-mobile-web-app-title" content="Legal Insight AI" />
      <link rel="alternate" href={currentUrl} hrefLang="x-default" />
      <link rel="alternate" href={currentUrl} hrefLang="en" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${title} - Legal Insight AI`} />
      <meta property="og:site_name" content="Legal Insight AI" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@LegalInsightAI" />
      <meta name="twitter:creator" content="@LegalInsightAI" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${title} - Legal Insight AI`} />
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta 
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content} 
        />
      ))}
      
      {/* Structured Data (Organization, WebSite, plus page-specific) */}
      {jsonLdPayloads.map((payload, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(payload)}
        </script>
      ))}
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.gpteng.co" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//legalinsightai.software" />
    </Helmet>
  );
};

export default SEOHead;
