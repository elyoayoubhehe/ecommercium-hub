import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientNav } from "@/components/ClientNav";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronDown, ShoppingCart, ImageIcon, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/contexts/ProductsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";

const Products = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { addToCart, items: cartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "";
  const inStock = searchParams.get("inStock") === "true";

  // Filter products based on URL parameters
  const filteredProducts = products
    .filter(product => {
      // Filter by category
      if (category && product.category !== category) {
        return false;
      }
      
      // Filter by price range
      if (minPrice && product.price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && product.price > parseFloat(maxPrice)) {
        return false;
      }
      
      // Filter by stock status
      if (inStock && product.status === 'out-of-stock') {
        return false;
      }
      
      // Filter by search term
      if (
        searchTerm &&
        !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort products
      if (sort === "price-asc") {
        return a.price - b.price;
      } else if (sort === "price-desc") {
        return b.price - a.price;
      } else if (sort === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sort === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // We don't need to update search params for search term, just filter in-memory
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === false || value === "") {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value.toString());
    }
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle adding product to cart
  const handleAddToCart = (product: any) => {
    // Check if product is in stock
    if (product.stock === 0 || product.status === 'out-of-stock') {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      description: product.description || '',
      category: product.category,
      stock: product.stock,
      image: product.image || '/products/placeholder.jpg'
    });
    
    toast.success(`${product.name} added to cart`);
  };

  // Check if a product is already in the cart
  const isInCart = (productId: string) => {
    return cartItems.some(item => item.id === productId);
  };

  const hasActiveFilters = !!category || !!minPrice || !!maxPrice || !!sort || inStock;

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div className="md:w-64 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-primary h-auto p-0"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${cat.id}`}
                        checked={category === cat.name}
                        onCheckedChange={(checked) => 
                          handleFilterChange("category", checked ? cat.name : "")
                        }
                      />
                      <Label
                        htmlFor={`category-${cat.id}`}
                        className="text-sm font-normal"
                      >
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="min-price" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max-price" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="999"
                      value={maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Sort By</h4>
                <RadioGroup
                  value={sort}
                  onValueChange={(value) => handleFilterChange("sort", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-asc" id="price-asc" />
                    <Label htmlFor="price-asc" className="text-sm font-normal">
                      Price: Low to High
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-desc" id="price-desc" />
                    <Label htmlFor="price-desc" className="text-sm font-normal">
                      Price: High to Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name-asc" id="name-asc" />
                    <Label htmlFor="name-asc" className="text-sm font-normal">
                      Name: A to Z
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="name-desc" id="name-desc" />
                    <Label htmlFor="name-desc" className="text-sm font-normal">
                      Name: Z to A
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={inStock}
                    onCheckedChange={(checked) =>
                      handleFilterChange("inStock", !!checked)
                    }
                  />
                  <Label htmlFor="in-stock" className="text-sm font-normal">
                    In Stock Only
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {category ? `${category} Products` : "All Products"}
              </h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down products by applying filters
                    </SheetDescription>
                  </SheetHeader>
                  {/* Mobile filters - would duplicate the desktop filters here */}
                </SheetContent>
              </Sheet>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No products found.</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;