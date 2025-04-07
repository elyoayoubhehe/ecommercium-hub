import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/contexts/CartContext';
import { useProducts, Product } from '@/contexts/ProductsContext';
import { Heart, ShoppingCart, Star, Minus, Plus, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, items: cartItems } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isInCart, setIsInCart] = useState(false);

  // Load product data based on ID
  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        // If product not found, redirect to products page
        toast.error("Product not found");
        navigate('/client/products');
      }
    }
  }, [id, products, navigate]);

  // Check if product is in cart
  useEffect(() => {
    if (product) {
      const itemInCart = cartItems.find(item => item.id === product.id);
      setIsInCart(!!itemInCart);
    }
  }, [product, cartItems]);

  // Handle quantity changes
  const handleQuantityChange = (value: number) => {
    if (product) {
      // Make sure quantity doesn't go below 1 or above available stock
      if (value >= 1 && value <= product.stock) {
        setQuantity(value);
      } else if (value > product.stock) {
        toast.error(`Maximum available quantity is ${product.stock}`);
        setQuantity(product.stock);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      description: product.description || '',
      category: product.category,
      stock: product.stock,
      image: product.image || '/products/placeholder.jpg'
    });
    
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/client/cart');
  };

  // Generate placeholder rating with stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <Star className="w-4 h-4 fill-primary text-primary absolute top-0 left-0 clip-half" />
        </div>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <ClientNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
              {product.image && product.image !== '/products/placeholder.jpg' ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">No image available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">{product.category}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {renderStars(product.rating || 4.5)}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 4.5}/5 ({product.reviews || 12} reviews)
              </span>
            </div>

            {/* Price */}
            <div>
              <h2 className="text-3xl font-bold">${product.price.toFixed(2)}</h2>
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-sm text-yellow-600 mt-1">Only {product.stock} left in stock!</p>
              )}
              {product.stock === 0 && (
                <p className="text-sm text-red-600 mt-1">Out of stock</p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 10 
                  ? 'In Stock' 
                  : product.stock > 0 
                    ? 'Low Stock' 
                    : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || product.stock === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      handleQuantityChange(value);
                    }
                  }}
                  className="h-10 w-16 text-center rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={product.stock === 0}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock || product.stock === 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isInCart ? 'Add More' : 'Add to Cart'}
              </Button>
              <Button 
                className="flex-1" 
                variant="secondary"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Description */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>{product.description || 'No description available.'}</p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="mt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>Product specifications will be displayed here.</p>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>Product reviews will be displayed here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
