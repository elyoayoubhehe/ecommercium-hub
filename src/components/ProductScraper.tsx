import { useState } from 'react';
import { ScrapingService, ScrapedProduct } from '../services/scraping';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, Star, ExternalLink } from 'lucide-react';

const scrapingService = new ScrapingService();

export function ProductScraper() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await scrapingService.searchProducts(searchTerm);
      setProducts(results);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (asin: string) => {
    try {
      await scrapingService.trackProduct(asin);
      // Show success message or update UI
    } catch (err) {
      console.error('Failed to track product:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex gap-3">
        <Input
          placeholder="Enter product name (e.g., 'gaming laptop', 'wireless headphones')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
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

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.asin} className="p-4 hover:shadow-lg transition-shadow">
            <img
              src={product.imageUrl}
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
                onClick={() => window.open(product.productUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Amazon
              </Button>
              <Button
                size="sm"
                onClick={() => handleTrack(product.asin)}
              >
                Track Price
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 