import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";

interface PromoCodeRedemption {
  starts_at: string;
  expires_at: string;
  plan_id: string;
  validity_duration_days: number;
  code?: string;
}

export const PromoCodeSection = () => {
  const { user } = useAuth();
  const { userPlan, refetch } = useUserPlan();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionInfo, setRedemptionInfo] = useState<PromoCodeRedemption | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active promo code redemption on component mount
  const fetchActiveRedemption = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('promo_code_redemptions')
        .select(`
          starts_at,
          expires_at,
          plan_id,
          validity_duration_days,
          promo_codes!inner(code)
        `)
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching redemption:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setRedemptionInfo({
          ...data,
          code: (data.promo_codes as any)?.code
        });
      }
    } catch (error) {
      console.error('Error fetching active redemption:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load active redemption on mount and when user changes
  useEffect(() => {
    fetchActiveRedemption();
  }, [user]);

  // Refetch when userPlan changes (in case plan got updated)
  useEffect(() => {
    if (userPlan && !isLoading) {
      fetchActiveRedemption();
    }
  }, [userPlan?.plan_id, userPlan?.expires_at]);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke('redeem-promo-code', {
        body: { code: promoCode.trim().toUpperCase() },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setRedemptionInfo(data.redemption);
      setPromoCode("");
      
      // Refetch user plan to update the UI
      await refetch();
      
      // Fetch the updated redemption info
      await fetchActiveRedemption();

      const isImmediate = new Date(data.redemption.starts_at) <= new Date();
      
      toast({
        title: "Success!",
        description: isImmediate 
          ? `Promo code redeemed! You now have ${data.redemption.validity_duration_days} days of Premium access.`
          : `Promo code redeemed! You'll receive ${data.redemption.validity_duration_days} days of Premium access after your current plan expires.`,
      });

    } catch (error: any) {
      console.error("Error redeeming promo code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to redeem promo code",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const isPromoActive = redemptionInfo && new Date(redemptionInfo.expires_at) > new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Promo Code
        </CardTitle>
        <CardDescription>
          Have a special promo code? Redeem it here for free Premium access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleRedeemCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promoCode">Enter Promo Code</Label>
            <div className="flex gap-2">
              <Input
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="PROMO-CODE"
                className="uppercase"
                disabled={isRedeeming}
              />
              <Button type="submit" disabled={isRedeeming || !promoCode.trim()}>
                {isRedeeming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  "Redeem"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Promo codes are case-insensitive and can only be used once per user
            </p>
          </div>
        </form>

        {isPromoActive && redemptionInfo && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Active Promo Code</span>
              <Badge variant="default">Premium Access</Badge>
            </div>
            <div className="space-y-2">
              {redemptionInfo.code && (
                <p className="text-sm">
                  <span className="font-medium">Code:</span>{" "}
                  <span className="font-semibold text-primary">{redemptionInfo.code}</span>
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">Validity:</span>{" "}
                <span className="font-semibold">{redemptionInfo.validity_duration_days} days</span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Access Period:</span>{" "}
                <span className="font-semibold">{formatDate(redemptionInfo.starts_at)} - {formatDate(redemptionInfo.expires_at)}</span>
              </p>
              {new Date(redemptionInfo.starts_at) > new Date() && (
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2 mt-2">
                  <span className="text-lg">⚠</span>
                  <span>Will activate after your current subscription ends</span>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
