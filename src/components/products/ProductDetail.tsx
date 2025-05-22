import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ClientNav } from '@/components/ClientNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from 'sonner';
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { mockProducts } from '@/data/mock';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // In a real app, this would be an API call
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    addItem(product);
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = () => {
    toast.success('Added to wishlist!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Mock data - in real app would come from API
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White'];
  const images = [
    product.image,
    '/products/alt1.jpg',
    '/products/alt2.jpg',
    '/products/alt3.jpg'
  ];

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative">
                      <img
                        src={image}
                        alt={`Product view ${index + 1}`}
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">(128 reviews)</span>
              </div>
              <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className="w-12 h-12"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Color</h3>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAddToWishlist}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Product Details */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Material</span>
                  <span>100% Cotton</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Care</span>
                  <span>Machine wash cold</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">SKU</span>
                  <span>{product.id}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="grid gap-6">
            {[1, 2, 3].map((review) => (
              <Card key={review} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">John Doe</h4>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-muted-foreground">2 days ago</span>
                </div>
                <p>Great product! The quality is excellent and it fits perfectly.</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
