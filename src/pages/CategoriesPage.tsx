import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Folder } from 'lucide-react';
import { ClientNav } from '@/components/ClientNav';
import { useApiGet } from '@/hooks/useApi';
import { standardizeCategory } from '@/utils/dataSync';

interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string;
  status?: string;
}

// Mock data as fallback if API is not available
const mockCategories = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    icon: '/images/categories/electronics.jpg',
    status: 'active'
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    icon: '/images/categories/fashion.jpg',
    status: 'active'
  },
  {
    id: 3,
    name: 'Home & Living',
    description: 'Furniture and home decor',
    icon: '/images/categories/home.jpg',
    status: 'active'
  },
  {
    id: 4,
    name: 'Books',
    description: 'Books across all genres',
    icon: '/images/categories/books.jpg',
    status: 'active'
  }
];

const ClientCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [useApi, setUseApi] = useState(true);
  
  // Fetch categories from API
  const { data: apiCategories, loading, error } = useApiGet<Category[]>('/categories');
  
  // Get product counts for each category
  const { data: products } = useApiGet<any[]>('/products');
  
  // Decide which categories to use - API or mock data
  const categories = useApi && apiCategories && !error 
    ? apiCategories
    : mockCategories;
    
  // Calculate product counts by category
  const productCountsByCategory = products?.reduce((counts, product) => {
    const categoryId = product.category_id;
    counts[categoryId] = (counts[categoryId] || 0) + 1;
    return counts;
  }, {});

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Shop by Category</h1>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={useApi} 
              onChange={() => setUseApi(!useApi)}
              className="accent-primary h-4 w-4" 
            />
            Use API Data
          </label>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && <p>Loading categories...</p>}
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
            <h3 className="font-bold">API Error</h3>
            <p>{error.message}</p>
            <p className="text-sm">Showing mock data as fallback.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link 
              key={category.id}
              to={`/client/products?category=${encodeURIComponent(category.name)}`}
              className="block hover:no-underline"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {category.icon ? (
                    <img 
                      src={category.icon} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <Folder className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.description || 'No description available'}</p>
                  <p className="text-sm text-primary mt-2">
                    {productCountsByCategory?.[category.id] || 0} products
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClientCategories;
