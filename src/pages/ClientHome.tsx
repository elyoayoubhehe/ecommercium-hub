import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { ClientNav } from "@/components/ClientNav";
import { Link } from 'react-router-dom';
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useProducts } from "@/contexts/ProductsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useOrders } from "@/contexts/OrdersContext";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ClientHome = () => {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { orders } = useOrders();
  const [productSections, setProductSections] = useState<any[]>([]);
  
  // Get in-progress orders
  const inProgressOrders = orders.filter(order => order.status === 'in-progress').length;

  // Function to handle scroll
  const handleScroll = (elementId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(elementId);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Create alternating product sections
  useEffect(() => {
    if (products.length === 0) return;

    const sections = [];
    const usedProductIds = new Set<string>();
    let remainingProducts = [...products];

    // Helper to get unique products
    const getUniqueProducts = (count: number, isGrid: boolean) => {
      const uniqueProducts = remainingProducts
        .filter(p => !usedProductIds.has(p.id))
        .slice(0, count);
      
      // Track used products
      uniqueProducts.forEach(p => usedProductIds.add(p.id));
      
      // Remove these products from remaining products
      remainingProducts = remainingProducts.filter(p => !uniqueProducts.map(up => up.id).includes(p.id));
      
      // If we run out of unique products, reset the pool but exclude products from this section
      if (remainingProducts.length < count && products.length > count) {
        const currentSectionIds = new Set(uniqueProducts.map(p => p.id));
        remainingProducts = products.filter(p => !currentSectionIds.has(p.id));
      }

      return {
        type: isGrid ? 'grid' : 'scroll',
        products: uniqueProducts
      };
    };

    // Add first grid section - Popular Products
    if (remainingProducts.length >= 3) {
      sections.push({
        ...getUniqueProducts(3, true),
        title: "Popular Products"
      });
    }

    // Add first scroll section - Best Sellers
    if (remainingProducts.length > 0) {
      sections.push({
        ...getUniqueProducts(Math.min(6, remainingProducts.length), false),
        title: "Best Sellers"
      });
    }

    // Add second grid section - New Arrivals
    if (remainingProducts.length >= 3) {
      sections.push({
        ...getUniqueProducts(3, true),
        title: "New Arrivals"
      });
    }

    // Add second scroll section - On Sale
    if (remainingProducts.length > 0) {
      sections.push({
        ...getUniqueProducts(Math.min(6, remainingProducts.length), false),
        title: "On Sale"
      });
    }

    setProductSections(sections);
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/client/cart">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <ShoppingCart className="w-8 h-8 text-primary mb-4" />
              <h2 className="font-semibold mb-2">My Cart</h2>
              <p className="text-muted-foreground">{cartItems.length} items pending</p>
            </Card>
          </Link>
          
          <Link to="/client/wishlist">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <Heart className="w-8 h-8 text-secondary mb-4" />
              <h2 className="font-semibold mb-2">Wishlist</h2>
              <p className="text-muted-foreground">{wishlistItems.length} saved items</p>
            </Card>
          </Link>
          
          <Link to="/client/orders">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <Package className="w-8 h-8 text-accent mb-4" />
              <h2 className="font-semibold mb-2">Orders</h2>
              <p className="text-muted-foreground">{inProgressOrders} in progress</p>
            </Card>
          </Link>
        </section>
        
        {/* Alternating Product Sections */}
        {productSections.map((section, index) => (
          <section key={index} className="mb-16">
            {section.type === 'grid' ? (
              // Grid Layout - 3 products in a row
              <>
                <h2 className="text-2xl font-semibold mb-6">{section.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              // Scrollable Layout
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleScroll(`scroll-section-${index}`, 'left')}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleScroll(`scroll-section-${index}`, 'right')}
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  id={`scroll-section-${index}`}
                  className="flex overflow-x-auto pb-4 gap-4 no-scrollbar"
                  style={{ 
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {section.products.map((product: any) => (
                    <div key={product.id} className="min-w-[250px] max-w-[250px] flex-shrink-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        ))}
      </main>
    </div>
  );
};

export default ClientHome;