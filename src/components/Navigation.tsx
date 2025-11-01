import { Link, useLocation } from "react-router-dom";
import { ModernLogo } from "@/components/ModernLogo";

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto py-3 px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-all duration-200">
            <ModernLogo />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`transition-all ${isActive('/') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
              Home
            </Link>
            <Link to="/about" className={`transition-all ${isActive('/about') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
              About
            </Link>
            <Link to="/chat" className={`transition-all ${isActive('/chat') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
              Chat
            </Link>
            <Link to="/games" className={`transition-all ${isActive('/games') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
              Games
            </Link>
            <Link to="/contact" className={`transition-all ${isActive('/contact') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;