import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import ClientHome from "./pages/ClientHome";
import AdminHome from "./pages/AdminHome";
import AdminProducts from "./pages/AdminProducts";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/client" element={<ClientHome />} />
          <Route path="/client/products" element={<Products />} />
          <Route path="/client/categories" element={<Categories />} />
          <Route path="/client/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;