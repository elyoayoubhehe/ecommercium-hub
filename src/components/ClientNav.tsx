import { ShoppingCart, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartSheet } from "./cart/CartSheet";

export const ClientNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
          <Button 
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Switch to Admin
          </Button>
          <CartSheet />
          <Button variant="ghost" size="icon" onClick={() => navigate('/client/profile')}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};