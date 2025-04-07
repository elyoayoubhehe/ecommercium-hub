import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/contexts/ProductsContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the wishlist button
    e.stopPropagation(); // Stop event propagation
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        image: product.image
      });
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <Link to={`/client/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          onClick={toggleWishlist}
        >
          <Heart 
            className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
          />
        </Button>
        <div className="aspect-square bg-muted">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
        </div>
      </Card>
    </Link>
  );
}; 