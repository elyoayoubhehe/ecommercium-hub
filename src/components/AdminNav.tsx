import { Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";

export const AdminNav = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-primary">E-Shop Admin</h1>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground">Dashboard</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Products</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Orders</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Users</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};