
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Link } from "react-router-dom";

export default function PlanExpirationAlert() {
  const { userPlan, loading } = useUserPlan();

  if (loading || !userPlan) return null;

  // Check if plan expires soon (within 7 days)
  const expiresAt = userPlan.expires_at ? new Date(userPlan.expires_at) : null;
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (!expiresAt || userPlan.plan_id === 'free') return null;

  const isExpiringSoon = expiresAt <= sevenDaysFromNow;
  const isExpired = expiresAt <= now;
  const daysUntilExpiration = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (isExpired) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Subscription Expired</AlertTitle>
        <AlertDescription className="text-red-700">
          Your subscription has expired. You've been moved to the free plan.{" "}
          <Link to="/pricing" className="underline font-medium">
            Renew your subscription
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isExpiringSoon) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Subscription Expiring Soon</AlertTitle>
        <AlertDescription className="text-amber-700 flex items-center justify-between">
          <span>
            Your subscription expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}.
          </span>
          <Link to="/pricing">
            <Button size="sm" className="ml-4">
              <Crown className="h-4 w-4 mr-2" />
              Renew Now
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
