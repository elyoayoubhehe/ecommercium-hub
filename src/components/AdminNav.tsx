import { Settings, LogOut, Plus, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";

export const AdminNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/admin" className="text-xl font-bold text-primary">E-Shop Admin</Link>
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/admin" 
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/products" 
              className="text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
            <Link 
              to="/admin/orders" 
              className="text-muted-foreground hover:text-foreground"
            >
              Orders
            </Link>
            <Link 
              to="/admin/users" 
              className="text-muted-foreground hover:text-foreground"
            >
              Users
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/client')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Switch to Client View
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};