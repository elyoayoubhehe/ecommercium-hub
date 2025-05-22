import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClientNav } from "@/components/ClientNav";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useApiGet } from "@/hooks/useApi";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { standardizeProduct } from "@/utils/dataSync";
import { toast } from "sonner";

interface Product {
  id: string | number;
  name: string;
  price: number;
  description: string;
  category: string;
  category_id?: number;
  image_url?: string;
  stock_quantity?: number;
  status?: string;
}

// Fallback mock product if API fails
const mockProduct: Product = {
  id: "1",
  name: "Smart LED TV",
  price: 699.99,
  description: "55-inch 4K Ultra HD Smart LED TV with HDR and Smart TV features. This TV delivers stunning picture quality with vibrant colors and deep blacks. Enjoy your favorite streaming services and apps directly on your TV.",
  category: "Electronics",
  stock_quantity: 15,
  image_url: "/products/tv.jpg"
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [useApi, setUseApi] = useState(true);
  
  // Fetch product and categories from API
  const { data: apiProduct, loading, error } = useApiGet<Product>(`/products/${id}`);
  
  // Decide which product to use - API or mock
  const product = useApi && apiProduct && !error ? apiProduct : mockProduct;
  
  // Convert stock value to a number we can use
  const stockQuantity = product?.stock_quantity || 0;
  
  // Check if product is in wishlist
  const productInWishlist = isInWishlist(product.id.toString());

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        quantity: quantity,
        description: product.description,
        category: product.category,
        stock: stockQuantity,
        image_url: product.image_url
      };
      
      addToCart(cartItem);
      alert(`${quantity} x ${product.name} added to cart!`);
    }
  };
  
  const handleWishlistToggle = () => {
    if (productInWishlist) {
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

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/client/products" className="text-primary hover:underline">
            ← Back to Products
          </Link>
        </div>
        
        {loading && <p>Loading product details...</p>}
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
            <h3 className="font-bold">API Error</h3>
            <p>{error.message}</p>
            <p className="text-sm">Showing mock data as fallback.</p>
            <label className="flex items-center gap-2 text-sm mt-2">
              <input 
                type="checkbox" 
                checked={useApi} 
                onChange={() => setUseApi(!useApi)}
                className="accent-primary h-4 w-4" 
              />
              Use API Data
            </label>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-primary/10 text-primary text-lg rounded-lg">
                {product.category}
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <Button 
                variant={productInWishlist ? "default" : "outline"} 
                size="icon" 
                className={`${productInWishlist ? 'bg-red-100 hover:bg-red-200 border-red-200' : ''} rounded-full`}
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-5 w-5 ${productInWishlist ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
              </Button>
            </div>
            <p className="text-2xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>
            
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Details</h2>
              <ul className="space-y-1 text-sm">
                <li><span className="font-medium">Category:</span> {product.category}</li>
                <li>
                  <span className="font-medium">Stock:</span> 
                  <span className={stockQuantity === 0 ? 'text-red-500' : 'text-green-500'}>
                    {stockQuantity > 0 ? `${stockQuantity} units` : 'Out of stock'}
                  </span>
                </li>
                {product.status && <li><span className="font-medium">Status:</span> {product.status}</li>}
              </ul>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <button 
                  className="w-8 h-8 flex items-center justify-center border rounded-l-md"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={stockQuantity === 0}
                >
                  -
                </button>
                <span className="w-12 h-8 flex items-center justify-center border-t border-b">
                  {quantity}
                </span>
                <button 
                  className="w-8 h-8 flex items-center justify-center border rounded-r-md"
                  onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                  disabled={stockQuantity === 0}
                >
                  +
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart} 
                disabled={stockQuantity === 0}
                className="bg-primary hover:bg-primary/90 flex-1"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
            
            {stockQuantity === 0 && (
              <p className="text-red-500">This product is currently out of stock.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
