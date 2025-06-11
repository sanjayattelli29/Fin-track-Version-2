
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleReturnHome = () => {
    // Explicitly navigate to dashboard to avoid 404 issues
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-finance-darker p-4">
      <div className="glass-card rounded-xl p-10 text-center max-w-md mx-auto animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full">
            <Frown className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-6">
          Page not found
        </p>
        <p className="text-gray-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={handleReturnHome} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
