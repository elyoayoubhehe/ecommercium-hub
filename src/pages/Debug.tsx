import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Debug = () => {
  const navigate = useNavigate();

  const routes = [
    { path: '/', name: 'Home' },
    { path: '/client/cart', name: 'Cart' },
    { path: '/client/checkout', name: 'Checkout' },
    { path: '/client/wishlist', name: 'Wishlist' },
    { path: '/client/products', name: 'Products' },
    { path: '/admin/dashboard', name: 'Admin Dashboard' },
    { path: '/admin/products', name: 'Admin Products' },
    { path: '/admin/categories', name: 'Admin Categories' },
    { path: '/admin/orders', name: 'Admin Orders' },
    { path: '/admin/settings', name: 'Admin Settings' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Debug Navigation</h1>
        
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
            Debug page for quick navigation during development.
            Press <kbd className="px-2 py-1 bg-muted rounded">Alt + D</kbd> from any page to access this debug menu.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Debug;
