import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';

const Debug = () => {
  const navigate = useNavigate();

  const routes = [
    // Client Routes
    { path: '/', name: 'Welcome' },
    { path: '/client', name: 'Client Home' },
    { path: '/client/products', name: 'Products List' },
    { path: '/client/categories', name: 'Categories' },
    { path: '/client/profile', name: 'User Profile' },
    { path: '/client/checkout', name: 'Checkout' },
    { path: '/client/search', name: 'Product Search' },
    
    // Admin Routes
    { path: '/admin', name: 'Admin Home' },
    { path: '/admin/orders', name: 'Orders Management' },
    { path: '/admin/products', name: 'Products Management' },
    { path: '/admin/categories', name: 'Categories Management' },
    { path: '/admin/users', name: 'Users Management' },
    { path: '/admin/settings', name: 'Admin Settings' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Keyboard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Debug Navigation</h1>
        </div>
        
        <div className="bg-muted p-4 rounded-md mb-6 flex items-center">
          <div className="mr-3">
            <kbd className="px-2 py-1 bg-background rounded border shadow-sm">Alt</kbd>
            {' + '}
            <kbd className="px-2 py-1 bg-background rounded border shadow-sm">D</kbd>
          </div>
          <p className="text-sm">
            Press this keyboard shortcut from any page to access this debug menu
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Client Routes</h2>
            <div className="space-y-2">
              {routes
                .filter(route => route.path.startsWith('/client') || route.path === '/')
                .map(route => (
                  <Button
                    key={route.path}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(route.path)}
                  >
                    {route.name}
                  </Button>
                ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Admin Routes</h2>
            <div className="space-y-2">
              {routes
                .filter(route => route.path.startsWith('/admin'))
                .map(route => (
                  <Button
                    key={route.path}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(route.path)}
                  >
                    {route.name}
                  </Button>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            This debug page allows for quick navigation during development.
            <br />
            Press <kbd className="px-2 py-1 bg-muted rounded">Alt + D</kbd> from anywhere in the application to instantly access this navigation menu.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Debug;
