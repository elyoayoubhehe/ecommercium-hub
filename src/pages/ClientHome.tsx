import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Package, History } from "lucide-react";
import { ClientNav } from "@/components/ClientNav";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useApiGet } from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Define Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  category_id?: number;
  image_url?: string;
  stock_quantity?: number;
  status?: string;
}

const ClientHome = () => {
  const { items: cartItems } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { data: apiProducts, loading } = useApiGet<Product[]>('/products');
  const { data: categories } = useApiGet<any[]>('/categories');

  // Get cart functionality
  const { addToCart } = useCart();
  
  // Function to add product to cart
  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: 1,
      description: product.description,
      category: product.category,
      stock: product.stock_quantity || 10,
      image_url: product.image_url
    });
    
    toast.success(`${product.name} added to cart`);
  };
  
  // Function to toggle wishlist
  const handleWishlistToggle = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (isInWishlist(product.id.toString())) {
      removeFromWishlist(product.id.toString());
    } else {
      addToWishlist({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        image_url: product.image_url
      });
    }
  };

  // Get featured products
  const getFeaturedProducts = () => {
    if (!apiProducts || apiProducts.length === 0) return [];
    
    // Return first 4 products or limit to 4 if more
    return apiProducts.slice(0, 4);
  };

  // Get featured categories - real categories from API
  const getFeaturedCategories = () => {
    if (!categories || categories.length === 0) return ['Electronics', 'Clothing', 'Home & Garden'];
    
    // Return first 3 categories or all if less than 3
    return categories.slice(0, 3).map(cat => cat.name);
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to E-Shop!</h1>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/client/checkout" className="block">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <ShoppingCart className="w-8 h-8 text-primary mb-4" />
              <h2 className="font-semibold mb-2">My Cart</h2>
              <p className="text-muted-foreground">{cartItems.length} items in cart</p>
            </Card>
          </Link>
          
          <Link to="/client/wishlist" className="block">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <Heart className="w-8 h-8 text-secondary mb-4" />
              <h2 className="font-semibold mb-2">Wishlist</h2>
              <p className="text-muted-foreground">{wishlistItems.length} saved items</p>
            </Card>
          </Link>
          
          <Link to="/client/orders" className="block">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <Package className="w-8 h-8 text-accent mb-4" />
              <h2 className="font-semibold mb-2">Orders</h2>
              <p className="text-muted-foreground">View your orders</p>
            </Card>
          </Link>
          
          <Link to="/client/orders" className="block">
            <Card className="dashboard-card hover:shadow-lg transition-shadow">
              <History className="w-8 h-8 text-primary mb-4" />
              <h2 className="font-semibold mb-2">History</h2>
              <p className="text-muted-foreground">View past orders</p>
            </Card>
          </Link>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Featured Categories</h2>
            <Link to="/client/categories" className="text-primary hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getFeaturedCategories().map((category) => (
              <Link to={`/client/products?category=${category}`} key={category}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">{category}</h3>
                  <p className="text-muted-foreground">Explore our {category.toLowerCase()} collection</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Featured Products</h2>
            <Link to="/client/products" className="text-primary hover:underline">
              View All
            </Link>
          </div>
          
          {loading && <p>Loading products...</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getFeaturedProducts().map((product) => (
              <Card key={product.id} className="overflow-hidden card-hover group">
                <Link to={`/client/product/${product.id}`} className="block">
                  <div className="aspect-square bg-muted relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary">
                        {product.category}
                      </div>
                    )}
                    
                    {/* Wishlist button */}
                    <button
                      className="absolute top-2 right-2 w-8 h-8 bg-background/80 rounded-full flex items-center justify-center shadow hover:bg-background transition-all"
                      onClick={(e) => handleWishlistToggle(product, e)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${isInWishlist(product.id.toString()) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
                      />
                    </button>
                    
                    {/* Quick add to cart button */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.description}
                    </p>
                    {product.stock_quantity !== undefined && (
                      <p className="text-xs mt-2 flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {product.stock_quantity > 0 
                          ? `In Stock (${product.stock_quantity})` 
                          : 'Out of Stock'}
                      </p>
                    )}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClientHome;