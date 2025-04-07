import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext"; // Fix the CategoriesProvider import to use the correct path
import { WishlistProvider } from "@/contexts/WishlistContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Welcome from "./pages/Welcome";
import ClientHome from "./pages/ClientHome";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ClientCategories from "./pages/ClientCategories";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import OrderSuccess from "./pages/OrderSuccess";
import ProductSearch from "./pages/ProductSearch";
import AdminHome from "./pages/AdminHome";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";
import Debug from "./pages/Debug";
import { Button } from './components/ui/button';
import { useTheme } from './components/theme-provider';
import { Sun, Moon } from 'lucide-react';
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";

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

// Keyboard shortcut component for Debug mode navigation
function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+D to navigate to debug page
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        navigate('/debug');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  
  return null; // This component doesn't render anything
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CategoriesProvider>
            <ProductsProvider>
              <WishlistProvider>
                <CartProvider>
                  <OrdersProvider>
                    <CheckoutProvider>
                      <div className="min-h-screen bg-background">
                        <KeyboardShortcuts />
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
                          <Route path="/client/cart" element={<Cart />} />
                          <Route path="/client/wishlist" element={<Wishlist />} />
                          <Route path="/client/orders" element={<Orders />} />
                          <Route path="/client/checkout" element={<Checkout />} />
                          <Route path="/client/order-success" element={<OrderSuccess />} />
                          <Route path="/client/search" element={<ProductSearch />} />

                          {/* Admin Routes */}
                          <Route path="/admin" element={<AdminHome />} />
                          <Route path="/admin/orders" element={<AdminOrders />} />
                          <Route path="/admin/products" element={<AdminProducts />} />
                          <Route path="/admin/categories" element={<AdminCategories />} />
                          <Route path="/admin/users" element={<AdminUsers />} />
                          <Route path="/admin/settings" element={<AdminSettings />} />
                          
                          {/* Debug Route */}
                          <Route path="/debug" element={<Debug />} />
                          
                          <Route path="*" element={<NotFound />} />
                        </Routes>

                        <footer className="border-t mt-auto">
                          <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
                            <p> 2024 EcommerciumHub. All rights reserved.</p>
                          </div>
                        </footer>
                      </div>
                      <Toaster position="top-right" />
                    </CheckoutProvider>
                  </OrdersProvider>
                </CartProvider>
              </WishlistProvider>
            </ProductsProvider>
          </CategoriesProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;