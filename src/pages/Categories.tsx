import { ClientNav } from "@/components/ClientNav";

const Categories = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Product Categories</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty'].map((category) => (
            <div 
              key={category}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{category}</h2>
              <p className="text-muted-foreground">Browse our selection of {category.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Categories;