import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Package, History } from "lucide-react";
import { ClientNav } from "@/components/ClientNav";
import { Link } from 'react-router-dom';

const ClientHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to E-Shop!</h1>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="dashboard-card">
            <ShoppingCart className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">My Cart</h2>
            <p className="text-muted-foreground">3 items pending</p>
          </Card>
          
          <Card className="dashboard-card">
            <Heart className="w-8 h-8 text-secondary mb-4" />
            <h2 className="font-semibold mb-2">Wishlist</h2>
            <p className="text-muted-foreground">12 saved items</p>
          </Card>
          
          <Card className="dashboard-card">
            <Package className="w-8 h-8 text-accent mb-4" />
            <h2 className="font-semibold mb-2">Orders</h2>
            <p className="text-muted-foreground">2 in progress</p>
          </Card>
          
          <Card className="dashboard-card">
            <History className="w-8 h-8 text-primary mb-4" />
            <h2 className="font-semibold mb-2">History</h2>
            <p className="text-muted-foreground">View past orders</p>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Electronics', 'Clothing', 'Home & Garden'].map((category) => (
              <Card key={category} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{category}</h3>
                <p className="text-muted-foreground">Explore our {category.toLowerCase()} collection</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden card-hover">
                <div className="aspect-square bg-muted" />
                <div className="p-4">
                  <h3 className="font-semibold">Product Name</h3>
                  <p className="text-muted-foreground">$99.99</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClientHome;