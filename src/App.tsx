import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import ClientHome from "./pages/ClientHome";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ClientCategories from "./pages/ClientCategories";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Debug from "./pages/Debug";

// Create and export the queryClient so it can be used by data synchronization utilities
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const DebugKeyboardShortcut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/debug');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <CartProvider>
              <WishlistProvider>
                <CheckoutProvider>
                  <OrderProvider>
                    <DebugKeyboardShortcut />
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Welcome />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      
                      {/* Client Routes that don't require auth */}
                      <Route path="/client" element={<ClientHome />} />
                      <Route path="/client/products" element={<Products />} />
                      <Route path="/client/product/:id" element={<ProductDetail />} />
                      <Route path="/client/categories" element={<ClientCategories />} />
                      <Route path="/client/wishlist" element={<Wishlist />} />
                      
                      {/* Protected Client Routes */}
                      <Route 
                        path="/client/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client/checkout" 
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client/orders" 
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/client/orders/:orderId" 
                        element={
                          <ProtectedRoute>
                            <OrderConfirmationPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Admin Routes - all protected and admin-only */}
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminHome />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/orders" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminOrders />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/products" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminProducts />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/categories" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminCategories />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminUsers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/settings" 
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminSettings />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route path="/debug" element={<Debug />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                  </OrderProvider>
                </CheckoutProvider>
              </WishlistProvider>
            </CartProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;