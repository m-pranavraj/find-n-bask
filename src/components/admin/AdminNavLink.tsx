
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function AdminNavLink({ href, icon, label }: AdminNavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className="w-full justify-start"
    >
      <Link to={href} className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
}
