import { useState } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'E-Shop',
    email: 'admin@eshop.com',
    phone: '+1 234 567 890',
    address: '123 Commerce St, Business City, 12345',
    currency: 'USD',
    taxRate: '20',
    enableNotifications: true,
    darkMode: false,
    maintenanceMode: false
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new orders and customer messages
                  </p>
                </div>
                <Switch
                  checked={storeSettings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setStoreSettings({ ...storeSettings, enableNotifications: checked })
                  }
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the admin dashboard
                  </p>
                </div>
                <Switch
                  checked={storeSettings.darkMode}
                  onCheckedChange={(checked) =>
                    setStoreSettings({ ...storeSettings, darkMode: checked })
                  }
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the store in maintenance mode
                  </p>
                </div>
                <Switch
                  checked={storeSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setStoreSettings({ ...storeSettings, maintenanceMode: checked })
                  }
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;
