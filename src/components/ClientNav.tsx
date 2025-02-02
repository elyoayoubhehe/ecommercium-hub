import { ShoppingCart, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";

export const ClientNav = () => {
  const location = useLocation();
  
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/client" className="text-xl font-bold text-primary">E-Shop</Link>
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/client" 
              className={`${location.pathname === '/client' ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground transition-colors`}
            >
              Home
            </Link>
            <Link 
              to="/client/products" 
              className={`${location.pathname === '/client/products' ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground transition-colors`}
            >
              Products
            </Link>
            <Link 
              to="/client/categories" 
              className={`${location.pathname === '/client/categories' ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground transition-colors`}
            >
              Categories
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ShoppingCart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};