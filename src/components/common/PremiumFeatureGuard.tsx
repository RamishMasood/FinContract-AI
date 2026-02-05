
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlanFeatureAccess } from "@/hooks/usePlanFeatureAccess";

interface PremiumFeatureGuardProps {
  children: ReactNode;
  feature: "ndaGenerator" | "legalChat" | "disputeResponse" | "jurisdictionSuggestions";
  title?: string;
  description?: string;
}

export default function PremiumFeatureGuard({ 
  children, 
  feature, 
  title = "Premium Feature",
  description = "This feature is available with Monthly Subscription"
}: PremiumFeatureGuardProps) {
  const featureAccess = usePlanFeatureAccess();

  if (featureAccess.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-legal-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (featureAccess[feature]) {
    return <>{children}</>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-center gap-2 text-amber-800 font-medium">
              <Lock className="h-4 w-4" />
              <span>Premium Subscription Required</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Upgrade to Premium Subscription to access:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Auto NDA & Agreement Generator</li>
              <li>• Legal Advice Chat</li>
              <li>• Email Dispute Response</li>
              <li>• Jurisdiction-Based Suggestions</li>
              <li>• Unlimited Contract Analysis</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/pricing">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
