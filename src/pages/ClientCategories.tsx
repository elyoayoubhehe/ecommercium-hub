import { useState } from "react";
import { ClientNav } from "@/components/ClientNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useCategories } from "@/contexts/CategoriesContext";

const ClientCategories = () => {
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.status === 'active' &&
      (category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Categories</h2>
          <Link to="/client/products">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Link 
              key={category.id}
              to={`/client/products?category=${encodeURIComponent(category.name)}`}
              className="block hover:no-underline"
            >
              <Card className="p-6 h-full transition-all hover:border-primary hover:shadow-md">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mb-4">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description || "Explore our products in this category"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No categories found matching your search.</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientCategories;
