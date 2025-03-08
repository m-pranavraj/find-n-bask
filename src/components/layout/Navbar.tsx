
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Logo } from "../ui/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Post Found Item", path: "/post-found-item" },
    { name: "Search Lost Items", path: "/search-lost-items" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Success Stories", path: "/success-stories" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
        >
          <Logo className="h-8 w-8" />
          <span className="font-bold text-xl">Find & Bask</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 hover:bg-accent hover:text-accent-foreground ${
                isActive(link.path)
                ? "bg-accent text-accent-foreground"
                : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
            )}
          </Button>
          
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <Button 
                variant={location.pathname === "/login" ? "default" : "ghost"} 
                className="font-medium"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button 
                variant={location.pathname === "/signup" ? "secondary" : "default"} 
                className="font-medium"
              >
                Sign Up
              </Button>
            </Link>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4">
                  <Link to="/" className="flex items-center space-x-2">
                    <Logo className="h-6 w-6" />
                    <span className="font-bold">Find & Bask</span>
                  </Link>
                </div>
                
                <nav className="flex flex-col space-y-1 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive(link.path)
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-auto space-y-3 pt-4">
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
