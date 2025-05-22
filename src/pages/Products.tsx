import { Card } from "@/components/ui/card";
import { ClientNav } from "@/components/ClientNav";
import { useSearchParams, Link } from "react-router-dom";
import { useApiGet } from "@/hooks/useApi";
import { useState } from "react";
import { standardizeProduct } from "@/utils/dataSync";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

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

// Mock data as fallback if API is not available
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Smart LED TV",
    price: 699.99,
    description: "55-inch 4K Ultra HD Smart LED TV",
    category: "Electronics",
    image_url: "/products/tv.jpg"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    price: 199.99,
    description: "Noise Cancelling Bluetooth Headphones",
    category: "Electronics",
    image_url: "/products/headphones.jpg"
  },
  {
    id: 3,
    name: "Cotton T-Shirt",
    price: 24.99,
    description: "Comfortable Cotton Casual T-Shirt",
    category: "Clothing",
    image_url: "/products/tshirt.jpg"
  },
  {
    id: 4,
    name: "Denim Jeans",
    price: 59.99,
    description: "Classic Fit Denim Jeans",
    category: "Clothing",
    image_url: "/products/jeans.jpg"
  },
  {
    id: 5,
    name: "Novel Collection",
    price: 49.99,
    description: "Bestselling Novel Collection Set",
    category: "Books",
    image_url: "/products/books.jpg"
  },
  {
    id: 6,
    name: "Garden Tools Set",
    price: 89.99,
    description: "Complete Garden Tools Kit",
    category: "Home & Garden",
    image_url: "/products/garden-tools.jpg"
  },
  {
    id: 7,
    name: "Basketball",
    price: 29.99,
    description: "Professional Basketball",
    category: "Sports",
    image_url: "/products/basketball.jpg"
  },
  {
    id: 8,
    name: "Skincare Set",
    price: 79.99,
    description: "Premium Skincare Collection",
    category: "Beauty",
    image_url: "/products/skincare.jpg"
  }
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [useApi, setUseApi] = useState(true);
  
  // Fetch products and categories from API
  const { data: apiProducts, loading, error } = useApiGet<Product[]>('/products');
  const { data: categories } = useApiGet<any[]>('/categories');
  
  // Get wishlist functionality
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Get cart functionality
  const { addToCart } = useCart();
  
  // Decide which products to use - API or mock data
  const products = useApi && apiProducts && !error 
    ? apiProducts
    : mockProducts;

  const filteredProducts = category
    ? products.filter(product => product.category === category)
    : products;
    
  const handleWishlistToggle = (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isInWishlist(product.id.toString())) {
      removeFromWishlist(product.id.toString())
        .then(() => {
          // Wishlist successfully updated
        })
        .catch(error => {
          console.error("Error removing from wishlist:", error);
          toast.error("Could not remove from wishlist. Please try again.");
        });
    } else {
      addToWishlist({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        image_url: product.image_url
      })
        .then(() => {
          // Wishlist successfully updated
        })
        .catch(error => {
          console.error("Error adding to wishlist:", error);
          toast.error("Could not add to wishlist. Please try again.");
        });
    }
  };
  
  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
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

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {category ? `${category} Products` : 'All Products'}
          </h1>
          <div className="flex gap-4 items-center">
            {category && (
              <Link
                to="/client/products"
                className="text-primary hover:underline"
              >
                View All Products
              </Link>
            )}
            <Link
              to="/client/wishlist"
              className="text-primary hover:underline flex items-center"
            >
              <Heart className="h-4 w-4 mr-1" />
              Wishlist
            </Link>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={useApi} 
                onChange={() => setUseApi(!useApi)}
                className="accent-primary h-4 w-4" 
              />
              Use API Data
            </label>
          </div>
        </div>
        
        {loading && <p>Loading products...</p>}
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
            <h3 className="font-bold">API Error</h3>
            <p>{error.message}</p>
            <p className="text-sm">Showing mock data as fallback.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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
                  <p className="text-sm text-muted-foreground mt-2">
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
      </main>
    </div>
  );
};

export default Products;