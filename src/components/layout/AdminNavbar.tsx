
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Database, 
  FileText, 
  Home, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Package, 
  Settings, 
  Shield, 
  Users 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const AdminNavbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const adminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    setIsAdmin(adminAuthenticated);
  }, []);

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { icon: <Shield className="h-4 w-4 mr-2" />, label: "Admin", href: "/admin/dashboard" },
    { icon: <Home className="h-4 w-4 mr-2" />, label: "Back to Site", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 md:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link to="/" className="flex items-center gap-2 py-4">
                <Shield className="h-5 w-5" />
                <span className="font-bold">Admin Panel</span>
              </Link>
            </div>
            <div className="flex flex-col gap-2 mt-4 px-4">
              <AdminNavLink
                href="/admin/dashboard"
                icon={<BarChart3 className="h-4 w-4 mr-2" />}
                label="Dashboard"
              />
              <AdminNavLink
                href="/admin/users"
                icon={<Users className="h-4 w-4 mr-2" />}
                label="Users"
              />
              <AdminNavLink
                href="/admin/items"
                icon={<Package className="h-4 w-4 mr-2" />}
                label="Items"
              />
              <AdminNavLink
                href="/admin/claims"
                icon={<FileText className="h-4 w-4 mr-2" />}
                label="Claims"
              />
              <AdminNavLink
                href="/admin/messages"
                icon={<MessageSquare className="h-4 w-4 mr-2" />}
                label="Messages"
              />
              <AdminNavLink
                href="/admin/database"
                icon={<Database className="h-4 w-4 mr-2" />}
                label="Database"
              />
              <AdminNavLink
                href="/admin/settings"
                icon={<Settings className="h-4 w-4 mr-2" />}
                label="Settings"
              />
              <AdminNavLink
                href="/"
                icon={<Home className="h-4 w-4 mr-2" />}
                label="Back to Site"
              />
              <Button 
                variant="destructive" 
                size="sm"
                className="mt-4 w-full justify-start"
                onClick={() => {
                  localStorage.removeItem("adminAuthenticated");
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span className="hidden font-bold sm:inline-block">
              Find & Bask Admin
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item, index) => (
              <AdminNavLink
                key={index}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center">
            <ThemeToggle />
            <div className="ml-4 flex items-center gap-2">
              {user && (
                <p className="text-sm font-medium">
                  Admin: {user.email?.split("@")[0]}
                </p>
              )}
              <Button 
                variant="destructive" 
                size="sm"
                className="hidden md:flex"
                onClick={() => {
                  localStorage.removeItem("adminAuthenticated");
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
