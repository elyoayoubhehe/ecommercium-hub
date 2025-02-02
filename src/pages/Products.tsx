import { ClientNav } from "@/components/ClientNav";

const Products = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 8].map((item) => (
            <div key={item} className="group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <div className="w-full h-full bg-muted" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Product Name</h3>
                <p className="text-muted-foreground">$99.99</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;