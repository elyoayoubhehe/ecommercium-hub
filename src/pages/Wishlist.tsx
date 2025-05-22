import React, { useState } from 'react';
import { ClientNav } from '@/components/ClientNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Trash, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id || item.product_id?.toString(),
      name: item.name,
      price: item.price,
      quantity: 1,
      description: item.description || "",
      category: item.category,
      stock: 10, // Default stock value
      image_url: item.image_url
    });
    
    toast.success(`${item.name} added to cart`);
  };
  
  const handleRemoveFromWishlist = async (id: string, name: string) => {
    setIsRemoving(id);
    try {
      await removeFromWishlist(id);
      toast.success(`${name} removed from wishlist`);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    } finally {
      setIsRemoving(null);
    }
  };
  
  const handleClearWishlist = async () => {
    if (items.length === 0) return;
    
    setIsClearing(true);
    try {
      await clearWishlist();
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setIsClearing(false);
    }
  };
  
  // Determine the message to show when the wishlist is empty
  const getEmptyMessage = () => {
    if (!isAuthenticated) {
      return "Please log in to save your wishlist across devices.";
    }
    return "Your wishlist items will be saved across devices.";
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Wishlist</h1>
          <Button 
            variant="outline" 
            onClick={handleClearWishlist}
            disabled={items.length === 0 || isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear All'}
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">{getEmptyMessage()}</p>
            <Link to="/client/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id || item.product_id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      {item.category}
                    </div>
                  )}
                  
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full"
                    onClick={() => handleRemoveFromWishlist(item.id || item.product_id?.toString() || "", item.name)}
                    disabled={isRemoving === (item.id || item.product_id?.toString())}
                  >
                    {isRemoving === (item.id || item.product_id?.toString()) ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <p className="text-lg font-bold text-primary">${Number(item.price).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4 line-clamp-2">
                    {item.description || `Product in ${item.category} category`}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Link 
                      to={`/client/product/${item.id || item.product_id}`} 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      View
                    </Link>
                  </div>
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
