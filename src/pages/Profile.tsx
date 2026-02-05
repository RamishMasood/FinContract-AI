import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, User, Phone, Mail, CreditCard, Copy, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePlanUsage } from "@/hooks/usePlanUsage";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PromoCodeSection } from "@/components/dashboard/PromoCodeSection";

interface ProfileData {
  full_name: string;
  phone_number: string;
  avatar_url?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { planId, originalPlanId, isPlanExpired } = usePlanUsage();
  const { userPlan } = useUserPlan();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    phone_number: "",
    avatar_url: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    thisMonthReferrals: 0,
    currentReward: null as string | null
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfileData();
    fetchReferralStats();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfileData({
        full_name: data.full_name || "",
        phone_number: data.phone_number || "",
        avatar_url: data.avatar_url || ""
      });
    }
  };

  const fetchReferralStats = async () => {
    if (!user) return;

    // Get total referrals
    const { data: totalReferrals } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_user_id", user.id);

    // Get this month's referrals that made purchases
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const startOfCurrentMonth = `${currentMonth}-01`;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const startOfNextMonth = nextMonth.toISOString().slice(0, 7) + '-01';
    
    const { data: monthlyReferrals } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_user_id", user.id)
      .not("first_paid_purchase_at", "is", null)
      .gte("first_paid_purchase_at", startOfCurrentMonth)
      .lt("first_paid_purchase_at", startOfNextMonth);

    // Get current active referral reward
    const { data: activeReward } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("user_id", user.id)
      .lte("starts_at", new Date().toISOString())
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setReferralStats({
      totalReferrals: totalReferrals?.length || 0,
      thisMonthReferrals: monthlyReferrals?.length || 0,
      currentReward: activeReward?.plan_id || null
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        phone_number: profileData.phone_number,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }

    setIsLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Error",
        description: passwordValidation.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // First verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: oldPassword
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        // Clear form
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one special character (@$!%*?&)" };
    }
    return { isValid: true };
  };

  const copyReferralCode = async () => {
    if (!user?.email) return;
    
    try {
      await navigator.clipboard.writeText(user.email);
      setCopiedReferral(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy referral code",
        variant: "destructive",
      });
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Basic';
      case 'premium': return 'Premium';  
      case 'free': return 'Free Trial';
      default: return 'Free Trial';
    }
  };

  const getReferralRewardText = () => {
    const monthlyCount = referralStats.thisMonthReferrals;
    if (monthlyCount === 0) {
      return "No referrals this month. Get 1 referral for Basic plan reward, 2+ for Premium plan reward.";
    } else if (monthlyCount === 1) {
      return "1 referral this month - Basic plan reward earned! Get 1 more for Premium upgrade.";
    } else {
      return `${monthlyCount} referrals this month - Premium plan reward earned!`;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-legal-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-legal-text">Profile Settings</h1>
              <p className="text-legal-muted">Manage your account information and preferences</p>
            </div>

            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={planId === 'free' ? 'secondary' : 'default'} className="text-sm">
                      {getPlanDisplayName(planId)}
                    </Badge>
                    {isPlanExpired && (
                      <Badge variant="destructive" className="ml-2">
                        Expired
                      </Badge>
                    )}
                    {userPlan?.is_referral_reward && (
                      <Badge variant="outline" className="ml-2">
                        Referral Reward: {getPlanDisplayName(planId)}
                      </Badge>
                    )}
                    {userPlan?.is_promo_code && (
                      <Badge variant="outline" className="ml-2 bg-primary/10">
                        Promo Code: {getPlanDisplayName(planId)}
                      </Badge>
                    )}
                  </div>
                  <Button onClick={() => navigate("/pricing")} variant="outline">
                    Change Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code Section */}
            <PromoCodeSection />

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="fullName"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="John Doe"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Cannot be changed)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="phoneNumber"
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Referral System */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
                <CardDescription>
                  Earn free plan upgrades by referring friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={user.email}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyReferralCode}
                    >
                      {copiedReferral ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this email with friends who can use it in the "Referral Email" field during signup to earn rewards when they purchase paid plans
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Referral Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-legal-primary">{referralStats.totalReferrals}</div>
                      <div className="text-sm text-muted-foreground">Total Referrals</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-legal-primary">{referralStats.thisMonthReferrals}</div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getReferralRewardText()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">How the Referral Program Works</h4>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h5 className="font-medium text-sm">Step-by-Step Process:</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-legal-primary text-white text-xs rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                        <span>Share your referral code (your email address) with friends and colleagues</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-legal-primary text-white text-xs rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                        <span>When they sign up, they must enter your email in the "Referral Email" field during registration</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-legal-primary text-white text-xs rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                        <span>When your referred friend purchases their first paid plan (Basic or Premium), you earn rewards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-6 h-6 bg-legal-primary text-white text-xs rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
                        <span>Your reward plan activates automatically after your current plan expires</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-legal-primary/5 p-4 rounded-lg space-y-2">
                    <h5 className="font-medium text-sm">Reward Structure:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>1 successful referral per month</strong> = Basic plan for 1 month (free)</li>
                      <li>• <strong>2+ successful referrals per month</strong> = Premium plan for 1 month (free)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-2">
                    <h5 className="font-medium text-sm text-amber-800">Important Terms & Conditions:</h5>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Only first-time paid purchases count for rewards (not renewals or upgrades)</li>
                      <li>• Referrals must enter your email during initial signup (cannot be added later)</li>
                      <li>• Rewards are calculated monthly and stack sequentially after current plans expire</li>
                      <li>• Self-referrals and fraudulent activity will result in account suspension</li>
                      <li>• Reward plans cannot be transferred or exchanged for cash</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;