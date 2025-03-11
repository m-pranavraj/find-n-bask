
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to refresh the session
  const refreshSession = async (): Promise<void> => {
    try {
      console.log("Attempting to refresh session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        throw error;
      }
      
      console.log("Session refreshed successfully:", data.session ? "Session exists" : "No session");
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log("Fetching initial session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        console.log("Initial session fetch result:", data.session ? "Session exists" : "No session");
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession ? "Session exists" : "No session");
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token was refreshed automatically");
      }
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Account created successfully", {
        description: "Please check your email for verification link.",
      });
      
      navigate("/login");
    } catch (error: any) {
      toast.error("Error creating account", {
        description: error.message,
      });
      console.error("Error signing up:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Refresh the session to ensure we have the latest tokens
      await refreshSession();
      
      toast.success("Login successful", {
        description: "Welcome back to Find & Bask!",
      });
      
      navigate("/");
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message,
      });
      console.error("Error signing in:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Error signing out", {
        description: error.message,
      });
      console.error("Error signing out:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!session,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
