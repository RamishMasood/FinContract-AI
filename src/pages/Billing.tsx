
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Check, AlertCircle, Lock, Sparkles, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PLANS, { Plan } from "@/constants/pricingPlans";
import { cn } from "@/lib/utils";

// Helper for feature lists
function getPlanFeatureMap(plan: Plan) {
  const included = plan.features.map((f) => ({
    feature: f,
    included: true,
  }));
  const notIncluded =
    plan.notIncluded?.map((f) => ({
      feature: f,
      included: false,
    })) || [];
  return [...included, ...notIncluded];
}

// Document badge, duplicated from pricing page
function DocumentCountBadge({ plan }: { plan: Plan }) {
  let text = null;
  let colorClass =
    "inline-block rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-sm font-semibold mb-2 animate-fade-in";
  if (plan.documentCount === "unlimited") {
    text = "Unlimited documents";
  } else if (typeof plan.documentCount === "number") {
    text = `${plan.documentCount} document${plan.documentCount !== 1 ? "s" : ""}`;
  } else {
    return null;
  }
  return <span className={colorClass}>{text}</span>;
}

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const handleUpgrade = (plan: string) => {
    setActivePlan(plan);
    toast({
      title: "Plan selected",
      description: `The ${plan} plan has been selected. Please complete your payment information.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
          <p className="text-legal-muted mb-8">Manage your subscription and payment methods</p>

          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="plans">
              <div className="grid md:grid-cols-3 gap-7">
                {PLANS.map((plan, i) => {
                  const isCurrent = activePlan === plan.id;
                  const allFeatures = getPlanFeatureMap(plan);

                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        "relative p-8 flex flex-col h-full overflow-visible border shadow-lg animate-scale-in transition-all hover:scale-[1.03]",
                        plan.highlight
                          ? "border-legal-primary shadow-legal-primary/20 ring-2 ring-legal-primary ring-offset-2"
                          : "border-gray-200",
                        isCurrent && "bg-legal-primary/5 border-legal-primary"
                      )}
                      style={{ animationDelay: `${i * 0.09}s` }}
                    >
                      {/* Badge and Most Popular */}
                      {plan.highlight && (
                        <div className="absolute -top-6 right-4 z-10 flex items-center gap-1 drop-shadow animate-bounce">
                          <span className="bg-legal-primary text-white text-xs px-3 py-1 rounded-full font-semibold">
                            <Sparkles className="inline-block mr-1 -mt-0.5" size={16} />
                            Most Popular
                          </span>
                        </div>
                      )}
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        {plan.name}
                        {isCurrent && (
                          <span className="bg-green-100 text-green-800 px-3 py-0.5 ml-2 rounded-md text-xs font-semibold inline-flex items-center gap-1">
                            Your Plan <Check className="h-4 w-4 inline ml-1" />
                          </span>
                        )}
                      </h3>
                      {/* Price and info */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-extrabold">{plan.price}</span>
                        {plan.id === "monthly" && (
                          <span className="text-legal-muted text-lg font-medium">/month</span>
                        )}
                      </div>
                      <p className="text-legal-muted mb-5">{plan.description}</p>
                      {/* Document count badge */}
                      <div className="mb-6">
                        <DocumentCountBadge plan={plan} />
                      </div>
                      {/* Features list */}
                      <ul className="space-y-2 mb-7">
                        {allFeatures.map(({ feature, included }, idx) => (
                          <li
                            key={idx}
                            className={cn(
                              "flex items-start gap-2 text-base group relative",
                              !included && "text-legal-muted"
                            )}
                          >
                            {included ? (
                              <Check className="h-5 w-5 text-legal-success flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="select-none">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Select plan / state button */}
                      <Button
                        className={cn(
                          plan.highlight
                            ? "bg-legal-primary hover:bg-legal-primary/90"
                            : "bg-legal-secondary hover:bg-legal-secondary/90",
                          "w-full text-lg font-semibold py-4 shadow shadow-legal-primary/10 transition-all hover:scale-105"
                        )}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrent}
                      >
                        {isCurrent
                          ? "Current Plan"
                          : plan.id === "free"
                          ? "Start Free Trial"
                          : "Select Plan"}
                      </Button>
                      {/* Auth overlay if not logged in */}
                      {!user && (
                        <div className="absolute inset-0 bg-white/70 z-20 flex flex-col items-center justify-center rounded-xl pointer-events-auto cursor-not-allowed transition animate-fade-in">
                          <span className="text-legal-muted text-base font-semibold flex flex-col items-center gap-2">
                            <Lock className="mb-1" />
                            Sign up or log in to select
                          </span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods securely</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-legal-muted" />
                      <div>
                        <p className="font-medium">••••••••• 4242</p>
                        <p className="text-sm text-legal-muted">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Delete
                    </Button>
                  </div>

                  <Button className="bg-legal-primary hover:bg-legal-primary/90">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Add Payment Method</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-legal-muted uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-legal-muted uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-legal-muted uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-legal-muted uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {user ? (
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-legal-text">
                              Apr 10, 2025
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-legal-text">
                              $29.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="link" className="text-legal-primary">
                                Download
                              </Button>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-legal-muted">
                              <div className="flex flex-col items-center justify-center py-6">
                                <AlertCircle className="h-8 w-8 text-legal-muted mb-2" />
                                <p>Please sign in to view your invoice history</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Billing;

// NOTE: This file is getting long! Consider asking AI to refactor it into smaller, focused components for maintainability.

