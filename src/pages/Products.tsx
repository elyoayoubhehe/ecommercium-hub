import { Card } from "@/components/ui/card";
import { ClientNav } from "@/components/ClientNav";
import { useSearchParams } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Smart LED TV",
    price: 699.99,
    description: "55-inch 4K Ultra HD Smart LED TV",
    category: "Electronics",
    image: "/products/tv.jpg"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    price: 199.99,
    description: "Noise Cancelling Bluetooth Headphones",
    category: "Electronics",
    image: "/products/headphones.jpg"
  },
  {
    id: 3,
    name: "Cotton T-Shirt",
    price: 24.99,
    description: "Comfortable Cotton Casual T-Shirt",
    category: "Clothing",
    image: "/products/tshirt.jpg"
  },
  {
    id: 4,
    name: "Denim Jeans",
    price: 59.99,
    description: "Classic Fit Denim Jeans",
    category: "Clothing",
    image: "/products/jeans.jpg"
  },
  {
    id: 5,
    name: "Novel Collection",
    price: 49.99,
    description: "Bestselling Novel Collection Set",
    category: "Books",
    image: "/products/books.jpg"
  },
  {
    id: 6,
    name: "Garden Tools Set",
    price: 89.99,
    description: "Complete Garden Tools Kit",
    category: "Home & Garden",
    image: "/products/garden-tools.jpg"
  },
  {
    id: 7,
    name: "Basketball",
    price: 29.99,
    description: "Professional Basketball",
    category: "Sports",
    image: "/products/basketball.jpg"
  },
  {
    id: 8,
    name: "Skincare Set",
    price: 79.99,
    description: "Premium Skincare Collection",
    category: "Beauty",
    image: "/products/skincare.jpg"
  }
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  
  const filteredProducts = category
    ? mockProducts.filter(product => product.category === category)
    : mockProducts;

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {category ? `${category} Products` : 'All Products'}
          </h1>
          {category && (
            <a
              href="/products"
              className="text-primary hover:underline"
            >
              View All Products
            </a>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden card-hover">
              <div className="aspect-square bg-muted relative">
                {/* You can add actual images here */}
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary">
                  {product.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-lg font-bold text-primary">${product.price}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {product.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;