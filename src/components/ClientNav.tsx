import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, Home, Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSlideout } from './cart/CartSlideout';

export const ClientNav = () => {
  const location = useLocation();
  const { items: cartItems } = useCart();
  
  // Count total items in cart
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const navItems = [
    {
      title: 'Home',
      href: '/client',
      icon: Home
    },
    {
      title: 'Products',
      href: '/client/products',
      icon: ShoppingBag
    },
    {
      title: 'Search',
      href: '/client/search',
      icon: Search
    },
    {
      title: 'Cart',
      href: '/client/cart',
      icon: ShoppingCart,
      count: cartItemCount
    },
    {
      title: 'Profile',
      href: '/client/profile',
      icon: User
    }
  ];

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
                    'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CartSlideout />
            <Button variant="ghost" size="icon" asChild>
              <Link to="/client/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};