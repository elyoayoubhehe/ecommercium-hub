import { useState } from "react";
import { useSearch } from "@/contexts/SearchContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Search() {
  const [queryInput, setQueryInput] = useState("");
  const { search, state } = useSearch();
  const { results, isLoading } = state;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    await search(queryInput);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Products</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            type="search"
            placeholder="Search for products..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SearchIcon className="w-4 h-4" />
            )}
            <span className="ml-2">Search</span>
          </Button>
        </form>

        <AnimatePresence>
          {results && results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {results.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                  <p className="text-muted-foreground mb-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = `/client/products/${product.id}`}
                  >
                    View Details
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          ) : queryInput && !isLoading ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No products found for "{queryInput}"
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setQueryInput("")}
              >
                Clear Search
              </Button>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
