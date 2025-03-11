
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      if (!isAuthenticated && !isLoading) {
        console.log("Not authenticated, attempting to refresh session...");
        try {
          await refreshSession();
        } catch (error) {
          console.error("Session refresh failed:", error);
          toast.error("Your session has expired", {
            description: "Please login again to continue",
          });
        }
      }
    };

    checkAndRefreshSession();
  }, [isAuthenticated, isLoading, refreshSession]);

  // Add a retry mechanism to periodically check auth status
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const retryInterval = setInterval(() => {
      if (!isAuthenticated && !isLoading && retryCount < maxRetries) {
        console.log(`Retry ${retryCount + 1}/${maxRetries} for session refresh`);
        refreshSession();
        retryCount++;
      } else {
        clearInterval(retryInterval);
      }
    }, 2000); // Retry every 2 seconds
    
    return () => clearInterval(retryInterval);
  }, [isAuthenticated, isLoading, refreshSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary">Checking your session...</span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
