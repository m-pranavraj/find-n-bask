
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
