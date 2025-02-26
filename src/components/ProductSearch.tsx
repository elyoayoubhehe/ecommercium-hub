import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { productApi } from '../lib/api';
import { Product } from '../types/product';
import { Loader2, Search, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('all');

  const { data: products, isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ['products', searchTerm, selectedStore],
    queryFn: () => productApi.compareProducts(searchTerm),
    enabled: false,
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    await refetch();
    setIsSearching(false);
  };

  const exampleSearches = [
    "iPhone 13 Pro Max",
    "Samsung Galaxy S21",
    "Sony PlayStation 5",
    "Nike Air Max",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Search Guidance */}
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-5 w-5" />
          <h3 className="font-semibold">Search Tips</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter a product name, model, or brand to compare prices across multiple stores. 
          Be specific for better results (e.g., "iPhone 13 Pro 128GB" instead of just "iPhone").
        </p>
        <div className="text-sm">
          <span className="font-semibold">Try searching for: </span>
          {exampleSearches.map((example, index) => (
            <button
              key={example}
              onClick={() => setSearchTerm(example)}
              className="text-primary hover:underline mx-1"
            >
              {example}{index < exampleSearches.length - 1 ? "," : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Search Controls */}
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter product name (e.g., iPhone 13 Pro Max 128GB)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="ebay">eBay</SelectItem>
            <SelectItem value="walmart">Walmart</SelectItem>
            <SelectItem value="aliexpress">AliExpress</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || isSearching}
          className="min-w-[100px]"
        >
          {isLoading || isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Error: {error instanceof Error ? error.message : 'Something went wrong'}
        </div>
      )}

      {/* Results */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-contain mb-4"
              />
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                  {product.sourceSite}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(product.sourceUrl, '_blank')}
                >
                  View Details
                </Button>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    product.availability
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {product.availability ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : products && products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No products found. Try adjusting your search terms or selecting a different store.</p>
        </div>
      ) : null}
    </div>
  );
} 