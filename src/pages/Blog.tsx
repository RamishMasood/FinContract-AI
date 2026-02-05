import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Blog = () => {
  const { user } = useAuth();
  
  const posts = [
    {
      id: 1,
      title: "Understanding Force Majeure Clauses in the Post-Pandemic World",
      date: "April 10, 2025",
      excerpt: "How force majeure clauses have evolved after the global pandemic and what to look for in your contracts.",
      category: "Contract Law",
      author: "Jane Smith, JD"
    },
    {
      id: 2,
      title: "5 Red Flags in Employment Contracts Every Employee Should Know",
      date: "April 5, 2025",
      excerpt: "Learn about the common pitfalls and concerning clauses in employment contracts before you sign.",
      category: "Employment Law",
      author: "John Doe, Esq."
    },
    {
      id: 3,
      title: "The Rise of AI in Legal Document Analysis",
      date: "March 28, 2025",
      excerpt: "How artificial intelligence is transforming the way legal professionals and businesses analyze contracts.",
      category: "Legal Tech",
      author: "Sarah Johnson, Tech Analyst"
    },
    {
      id: 4,
      title: "Negotiating SaaS Agreements: A Comprehensive Guide",
      date: "March 15, 2025",
      excerpt: "Essential tips for negotiating Software as a Service agreements that protect your business interests.",
      category: "Technology Contracts",
      author: "Michael Chen, JD"
    }
  ];
  
  // Structured data for blog page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Legal Insight AI Blog",
    "description": "Expert insights on contract law, legal document analysis, and AI-powered legal technology",
    "url": "https://legalinsightai.software/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Legal Insight AI",
      "url": "https://legalinsightai.software"
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization", 
        "name": "Legal Insight AI"
      }
    }))
  };

  return (
    <>
      <SEOHead
        title="Expert Legal Technology Insights - Legal Insight AI Blog"
        description="Stay updated with the latest insights on contract law, legal document analysis, AI-powered legal technology, and industry best practices from our expert team."
        keywords="legal blog, contract law insights, legal technology news, AI legal trends, legal document analysis tips, legal industry updates, legal automation insights"
        canonicalUrl="https://legalinsightai.software/blog"
        structuredData={structuredData}
        additionalMeta={[
          { name: "robots", content: "index,follow,noarchive" }
        ]}
      />
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Legal Insight Blog</h1>
            <p className="text-legal-muted mb-8">Expert insights on contract law and legal document analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-legal-primary/20 to-legal-secondary/20 h-3"></div>
                <CardHeader>
                  <div className="text-sm text-legal-muted mb-1">{post.category} • {post.date}</div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-legal-muted">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Link to={`/blog/${post.id}`} className="text-legal-primary hover:text-legal-primary/90 inline-flex items-center">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
      </div>
    </>
  );
};

export default Blog;
