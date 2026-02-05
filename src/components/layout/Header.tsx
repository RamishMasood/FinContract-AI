import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, CreditCard, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import HeroLogo from "@/components/landing/HeroLogo"; // ADDED

type HeaderProps = {
  // No need for passed-in user props; use context
  onLogout?: () => void;
};

const Header = ({ onLogout }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null);
  const { user } = useAuth();
  const { userPlan, loading } = useUserPlan();

  // Fetch user profile data
  useEffect(() => {
    setIsMobileMenuOpen(false);
    
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Helper for showing current plan in header
  function PlanBadge() {
    if (!userPlan || loading) return null;
    
    // Check if plan is expired
    const isPlanExpired = userPlan.expires_at ? 
      new Date(userPlan.expires_at) < new Date() : false;
    
    // Show effective plan considering expiration
    const effectivePlanId = isPlanExpired ? "free" : userPlan.plan_id;
    
    let planDisplayName = "Free Trial";
    if (effectivePlanId === "basic") {
      planDisplayName = "Basic";
    } else if (effectivePlanId === "premium") {
      planDisplayName = "Premium";
    } else if (effectivePlanId === "pay-per-use") {
      planDisplayName = "Pay Per Use";
    }
    
    return (
      <span className="ml-2 md:ml-3 text-xs md:text-sm bg-legal-primary/10 text-legal-primary px-2 md:px-3 py-1 rounded font-semibold">
        {planDisplayName}
      </span>
    );
  }

  // Add logout functionality
  const { logout } = useAuth();

  // Handler for logout, supports callback prop but handles itself
  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
    // Optionally: toast? (could add if user wants)
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Begin logo + name row */}
        <div className="flex items-center">
          {/* Animated logo */}
          <span className="mr-2 select-none" style={{
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            <HeroLogoSmall />
          </span>
          <Link to="/" className="text-xl md:text-2xl font-bold flex items-center">
            <span className="gradient-text text-lg md:text-2xl">Legal</span>
            <span className="text-legal-text ml-1 text-lg md:text-2xl">Insight AI</span>
            {/* Plan badge appears to right of product name (desktop only) */}
            <span className="hidden md:inline">{user && <PlanBadge />}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 md:space-x-8">
          <Link to="/features" className="text-legal-text hover:text-legal-primary transition-colors text-sm md:text-base">
            Features
          </Link>
          <Link to="/pricing" className="text-legal-text hover:text-legal-primary transition-colors text-sm md:text-base">
            Pricing
          </Link>
          {user ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" className="border-legal-primary text-legal-primary hover:bg-legal-primary/10 text-sm md:text-base px-3 md:px-4 py-1 md:py-2">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="p-2 font-medium text-xs md:text-base">
                    {userProfile?.full_name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center text-sm md:text-base">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Documents</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center text-sm md:text-base">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm md:text-base">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-[#213B75] text-[#213B75] hover:bg-[#213B75]/10 text-sm md:text-base px-3 md:px-4 py-1 md:py-2">
                  Login
                </Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button className="bg-gradient-to-r from-[#213B75] to-[#314890] hover:from-[#182B57] hover:to-[#223372] text-white font-bold shadow-md transition-all text-sm md:text-base px-3 md:px-4 py-1 md:py-2">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white pb-3 px-2 animate-fade-in">
          <nav className="flex flex-col space-y-2 items-center">
            {/* Plan badge at the very top in mobile menu */}
            {user && (
              <div className="w-max mx-auto mt-2 mb-1">
                <PlanBadge />
              </div>
            )}
            <Link to="/features" className="px-3 py-2 text-legal-text hover:text-legal-primary text-base text-center" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </Link>
            <Link to="/pricing" className="px-3 py-2 text-legal-text hover:text-legal-primary text-base text-center" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 text-legal-text hover:text-legal-primary text-base text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/profile" className="px-3 py-2 text-legal-text hover:text-legal-primary text-base text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  Profile
                </Link>
                <button className="px-3 py-2 text-legal-text hover:text-legal-primary text-left text-base w-full text-center" style={{textAlign: "center"}} onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}>
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 w-full">
                <Link to="/auth" className="px-3 py-2 text-center border border-legal-primary text-legal-primary rounded-md text-base" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/auth?tab=signup" className="px-3 py-2 text-center bg-legal-primary text-white rounded-md text-base" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up Free
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

// Small version of animated logo for header and footer (38x38px)
function HeroLogoSmall() {
  return (
    <span style={{
      width: 38,
      height: 38,
      minWidth: 38,
      minHeight: 38,
      display: "inline-block"
    }}>
      <HeroLogoWithSize size={38} />
    </span>
  );
}

// Helper: Renders HeroLogo with controlled size
function HeroLogoWithSize({ size = 82 }) {
  // Compose the <span> content from HeroLogo, but scaled down for small usage
  // We'll reuse the same HeroLogo file, but allow size override on the root <span>
  // Use the exported HeroLogo as function, passing size
  // The original HeroLogo accepts no props, so we inline the logic here.
  // To avoid duplicate animation logic, we render the original and scale the content.
  return (
    <span style={{
      transform: `scale(${size / 82})`,
      transformOrigin: "top left",
      display: "inline-block"
    }}>
      <HeroLogo />
    </span>
  );
}

export default Header;
