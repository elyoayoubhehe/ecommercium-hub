import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, LogIn, UserPlus, LogOut, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSlideout } from './cart/CartSlideout';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ClientNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  // Basic navigation items always shown
  const baseNavItems = [
    {
      title: 'Home',
      href: '/client'
    },
    {
      title: 'Products',
      href: '/client/products'
    },
    {
      title: 'Categories',
      href: '/client/categories'
    }
  ];
  
  // Add Orders link only if user is authenticated
  const navItems = isAuthenticated 
    ? [
        ...baseNavItems,
        {
          title: 'Orders',
          href: '/client/orders'
        }
      ] 
    : baseNavItems;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/client" className="text-xl font-bold mr-8">
              E-Shop
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.title === 'Orders' && <Package className="mr-1 h-4 w-4" />}
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CartSlideout />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {user.first_name?.charAt(0) || ""}{user.last_name?.charAt(0) || ""}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium leading-none">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/client/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/client/orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="flex items-center space-x-1">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/register" className="flex items-center space-x-1">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};