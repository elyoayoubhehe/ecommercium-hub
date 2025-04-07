import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { ClientNav } from "@/components/ClientNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Wishlist = () => {
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, items: cartItems } = useCart();

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id);
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (item: any) => {
    // Check if product is in stock
    if (item.stock === 0 || item.status === 'out-of-stock') {
      toast.error(`${item.name} is out of stock`);
      return;
    }

    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      description: item.description || '',
      category: item.category,
      stock: item.stock,
      image: item.image
    });
    
    toast.success(`${item.name} added to cart`);
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.id === productId);
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlistItems.length} saved items</p>
        </div>
        
        {wishlistItems.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add items you love to your wishlist. Review them anytime and easily move them to your cart.
            </p>
            <Button asChild>
              <Link to="/client/products">Continue Shopping</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <Link to={`/client/products/${item.id}`}>
                    <div className="aspect-square bg-muted">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                </div>
                <div className="p-4">
                  <Link to={`/client/products/${item.id}`}>
                    <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground mb-4">${item.price.toFixed(2)}</p>
                  <Button 
                    className="w-full"
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0 || item.status === 'out-of-stock'}
                    variant={isInCart(item.id) ? "secondary" : "default"}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isInCart(item.id) ? "Add More to Cart" : "Add to Cart"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
