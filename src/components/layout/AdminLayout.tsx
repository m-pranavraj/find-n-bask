
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  BarChart3, 
  Database, 
  FileText, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Package, 
  Settings, 
  Shield, 
  Users 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = "Admin Dashboard" }: AdminLayoutProps) => {
  const [isClient, setIsClient] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    setIsClient(true);
    
    // Check admin authentication
    const isAdmin = localStorage.getItem("adminAuthenticated") === "true";
    const storedLastLogin = localStorage.getItem("adminLastLogin");
    
    if (!isAdmin) {
      toast.error("Admin authentication required", {
        description: "Please login to access the admin area",
      });
      navigate("/admin/login");
    } else {
      setLastLogin(storedLastLogin);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminLastLogin");
    
    toast.success("Logged out successfully", {
      description: "You have been logged out from admin panel",
    });
    
    navigate("/admin/login");
  };

  if (!isClient) {
    return null; // Prevent SSR issues
  }

  const navItems = [
    { name: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Items", icon: Package, path: "/admin/items" },
    { name: "Claims", icon: FileText, path: "/admin/claims" },
    { name: "Messages", icon: MessageSquare, path: "/admin/messages" },
    { name: "Success Stories", icon: FileText, path: "/admin/success-stories" },
    { name: "Database", icon: Database, path: "/admin/database" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* Mobile navigation */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4 z-10">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar 
            navItems={navItems} 
            onLogout={handleLogout} 
            lastLogin={lastLogin}
            currentUser={user?.email || "Admin"}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop navigation */}
      <div className="hidden lg:block w-64 border-r bg-card min-h-screen">
        <AdminSidebar 
          navItems={navItems} 
          onLogout={handleLogout} 
          lastLogin={lastLogin}
          currentUser={user?.email || "Admin"}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-background border-b h-16 flex items-center px-6 justify-between">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/")}
            >
              View Site
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

interface AdminSidebarProps {
  navItems: { name: string; icon: React.ComponentType<any>; path: string }[];
  onLogout: () => void;
  lastLogin: string | null;
  currentUser: string;
}

const AdminSidebar = ({ navItems, onLogout, lastLogin, currentUser }: AdminSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 px-2">
        <nav className="mt-4 space-y-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <div className="bg-muted rounded-md p-3 text-sm">
          <p className="font-medium">{currentUser}</p>
          {lastLogin && (
            <p className="text-muted-foreground text-xs mt-1">
              Last login: {new Date(lastLogin).toLocaleString()}
            </p>
          )}
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full mt-3"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
