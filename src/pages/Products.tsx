import { Card } from "@/components/ui/card";
import { ClientNav } from "@/components/ClientNav";

const Products = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Card key={item} className="overflow-hidden card-hover">
              <div className="aspect-square bg-muted" />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Product Name</h3>
                <p className="text-lg font-bold text-primary">$99.99</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;