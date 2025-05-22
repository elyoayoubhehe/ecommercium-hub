import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Tags,
  Settings
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tags
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export const AdminNav = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Link to="/admin" className="text-xl font-bold mr-8">
            Admin Dashboard
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
                <item.icon className="h-4 w-4 mr-2" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};