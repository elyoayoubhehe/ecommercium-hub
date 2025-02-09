import { ClientNav } from "@/components/ClientNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, ShoppingBag, CreditCard } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <User className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <p className="text-muted-foreground">Manage your personal details</p>
              </div>
            </div>
            <Button className="w-full">Edit Profile</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Settings className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Account Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences</p>
              </div>
            </div>
            <Button className="w-full">Manage Settings</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Order History</h2>
                <p className="text-muted-foreground">View your past orders</p>
              </div>
            </div>
            <Button className="w-full">View Orders</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <CreditCard className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <p className="text-muted-foreground">Manage your payment options</p>
              </div>
            </div>
            <Button className="w-full">Manage Payments</Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
