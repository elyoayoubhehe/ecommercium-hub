import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  images: string[];
}

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Premium Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
  price: 299.99,
  category: 'Electronics',
  rating: 4.5,
  stock: 50,
  images: ['/images/products/headphones-1.jpg', '/images/products/headphones-2.jpg']
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, items: wishlistItems } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // In a real app, fetch product based on id
  const product = mockProduct;

  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      description: product.description,
      category: product.category,
      stock: product.stock,
      image: product.images[0]
    });
    toast.success('Added to cart');
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      image: product.images[0]
    });
    toast.success('Added to wishlist');
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="aspect-square overflow-hidden">
              <div className="w-full h-full bg-muted" />
            </Card>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-muted rounded-md overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">{product.category}</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({product.rating})</span>
            </div>

            <div>
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                disabled={isInWishlist}
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-muted-foreground">{product.description}</p>
              </TabsContent>
              <TabsContent value="specifications" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm font-medium">Brand</div>
                    <div className="text-sm text-muted-foreground">Premium Audio</div>
                    <div className="text-sm font-medium">Connectivity</div>
                    <div className="text-sm text-muted-foreground">Bluetooth 5.0</div>
                    <div className="text-sm font-medium">Battery Life</div>
                    <div className="text-sm text-muted-foreground">Up to 30 hours</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <p className="text-muted-foreground">No reviews yet.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
