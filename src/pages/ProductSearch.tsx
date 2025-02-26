import { useState } from 'react';
import { ClientNav } from "@/components/ClientNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, History, Bell, ExternalLink, Loader2 } from 'lucide-react';

interface ScrapedProduct {
  title: string;
  price: string;
  asin: string;
  rating: string;
  reviews: string;
  image_url: string;
  product_url: string;
}

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Amazon Product Search</h1>

          {/* Search Tips */}
          <Card className="p-4 mb-6 bg-muted/50">
            <h2 className="font-semibold mb-2">Search Tips:</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Enter product name, model, or specific details</li>
              <li>• Example: "iPhone 13 Pro Max 256GB"</li>
              <li>• Use specific terms for better results</li>
            </ul>
          </Card>

          {/* Search Controls */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Results */}
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList>
              <TabsTrigger value="results">Search Results</TabsTrigger>
              <TabsTrigger value="tracked">
                <History className="h-4 w-4 mr-2" />
                Tracked Products
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="h-4 w-4 mr-2" />
                Price Alerts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.asin} className="p-4 hover:shadow-lg transition-shadow">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-48 object-contain mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold">{product.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews})
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(product.product_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Amazon
                      </Button>
                      <Button size="sm">
                        Track Price
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tracked">
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tracked Products</h3>
                <p>Start tracking products to see their price history and get alerts.</p>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Price Alerts</h3>
                <p>Set up alerts to get notified when prices drop.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 