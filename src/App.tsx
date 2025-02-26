import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { ThemeProvider } from "@/components/theme-provider";
import Welcome from "./pages/Welcome";
import ClientHome from "./pages/ClientHome";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ClientCategories from "./pages/ClientCategories";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import ProductSearch from "./pages/ProductSearch";
import AdminHome from "./pages/AdminHome";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";
import { Button } from './components/ui/button';
import { useTheme } from './components/theme-provider';
import { Sun, Moon } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CartProvider>
            <CheckoutProvider>
              <div className="min-h-screen bg-background">
                <header className="border-b">
                  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold hover:text-primary">
                      EcommerciumHub
                    </Link>
                    <div className="flex items-center gap-4">
                      <ThemeToggle />
                    </div>
                  </div>
                </header>

                <Routes>
                  {/* Client Routes */}
                  <Route path="/" element={<Welcome />} />
                  <Route path="/client" element={<ClientHome />} />
                  <Route path="/client/products" element={<Products />} />
                  <Route path="/client/products/:id" element={<ProductDetail />} />
                  <Route path="/client/categories" element={<ClientCategories />} />
                  <Route path="/client/profile" element={<Profile />} />
                  <Route path="/client/checkout" element={<Checkout />} />
                  <Route path="/client/search" element={<ProductSearch />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminHome />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>

                <footer className="border-t mt-auto">
                  <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
                    <p>© 2024 EcommerciumHub. All rights reserved.</p>
                  </div>
                </footer>
              </div>
              <Toaster position="top-right" />
            </CheckoutProvider>
          </CartProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;