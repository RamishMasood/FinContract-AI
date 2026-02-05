import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, CreditCard } from "lucide-react";
type DashboardHeaderProps = {
  credits?: number | string;
};
const DashboardHeader = ({
  credits
}: DashboardHeaderProps) => {
  return <div className="bg-white border-b border-gray-100 p-3 sm:p-4 md:px-16 md:py-5 flex flex-col gap-3 xs:gap-4 md:flex-row items-center justify-between">
      <div className="w-full md:w-auto px-4">
        <h1 className="text-xl font-semibold">My Documents</h1>
        <p className="text-legal-muted text-sm ">Manage and analyze your contracts</p>
      </div>
      
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full md:w-auto">
        {credits !== undefined && <div className="hidden md:block text-sm bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-legal-muted">Credits:</span>{" "}
            <span className="font-medium">
              {credits === undefined ? <span className="opacity-60">--</span> : credits === "Unlimited" ? "Unlimited" : credits}
            </span>
          </div>}
        
        <div className="flex gap-2 w-full xs:w-auto">
          <Link to="/billing" className="w-1/2 xs:w-auto">
            
          </Link>
          
          <Link to="/dashboard/upload" className="w-full xs:w-auto">
            <Button size="sm" className="bg-legal-primary hover:bg-legal-primary/90 flex items-center gap-1 w-full xs:w-auto">
              <Upload className="h-4 w-4" />
              <span>Analyze Contract</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>;
};
export default DashboardHeader;