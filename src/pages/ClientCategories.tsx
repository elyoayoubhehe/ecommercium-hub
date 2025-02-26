import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ClientNav } from '@/components/ClientNav';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image: string;
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    productCount: 150,
    image: '/images/categories/electronics.jpg'
  },
  {
    id: '2',
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    productCount: 300,
    image: '/images/categories/fashion.jpg'
  },
  {
    id: '3',
    name: 'Home & Living',
    description: 'Furniture and home decor',
    productCount: 200,
    image: '/images/categories/home.jpg'
  },
  {
    id: '4',
    name: 'Books',
    description: 'Books across all genres',
    productCount: 500,
    image: '/images/categories/books.jpg'
  }
];

const ClientCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Shop by Category</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link 
              key={category.id}
              to={`/client/products?category=${category.name}`}
              className="block hover:no-underline"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  <p className="text-sm text-primary mt-2">{category.productCount} products</p>
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
