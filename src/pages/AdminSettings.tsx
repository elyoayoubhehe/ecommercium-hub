import { useState, useEffect, useRef } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Sun, Moon } from 'lucide-react';

// Completely isolated theme storage key
const DARK_MODE_KEY = 'admin-settings-dark-mode-isolated';

const AdminSettings = () => {
  // Use a ref to prevent infinite loops
  const isInitialMount = useRef(true);
  const previousDarkMode = useRef<boolean | null>(null);
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'E-Shop',
    email: 'admin@eshop.com',
    phone: '+1 234 567 890',
    address: '123 Commerce St, Business City, 12345',
    currency: 'USD',
    taxRate: '20',
    enableNotifications: true,
    maintenanceMode: false
  });
  
  // Simple boolean state for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Run once on mount to initialize dark mode from localStorage
  useEffect(() => {
    if (!isInitialMount.current) return;
    
    try {
      // Get dark mode setting from localStorage
      const storedDarkMode = localStorage.getItem(DARK_MODE_KEY);
      if (storedDarkMode !== null) {
        const darkModeValue = storedDarkMode === 'true';
        setIsDarkMode(darkModeValue);
        previousDarkMode.current = darkModeValue;
      } else {
        // Default to user's system preference if not set
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        previousDarkMode.current = prefersDark;
      }
    } catch (e) {
      console.error('Error initializing dark mode:', e);
    }
    
    isInitialMount.current = false;
  }, []);
  
  // Apply dark mode when state changes
  useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) return;
    
    // Skip if value hasn't changed - prevents infinite loops
    if (previousDarkMode.current === isDarkMode) return;
    
    try {
      // Update the DOM
      if (isDarkMode) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      
      // Save to localStorage
      localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
      
      // Update ref to current value
      previousDarkMode.current = isDarkMode;
      
      console.log(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'}. Classes:`, document.documentElement.classList.toString());
    } catch (e) {
      console.error('Error applying dark mode:', e);
    }
  }, [isDarkMode]);

  // Toggle handler for the Switch component
  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    toast.success(`${!isDarkMode ? 'Dark' : 'Light'} mode activated`);
  };

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
            <Card className="p-6 space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the admin dashboard
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={!isDarkMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsDarkMode(false)}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  
                  <Button 
                    variant={isDarkMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsDarkMode(true)}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleToggleDarkMode}
                  />
                </div>
              </div>
              
              {/* Debug Info */}
              <div className="bg-muted p-4 rounded-md text-sm">
                <p>Dark mode: <span className="font-mono">{isDarkMode ? 'enabled' : 'disabled'}</span></p>
                <p>Initial render: <span className="font-mono">{isInitialMount.current ? 'yes' : 'no'}</span></p>
                <p>Previous value: <span className="font-mono">{previousDarkMode.current === null ? 'not set' : previousDarkMode.current ? 'dark' : 'light'}</span></p>
                <p>LocalStorage: <span className="font-mono">{typeof window !== 'undefined' ? localStorage.getItem(DARK_MODE_KEY) || 'not set' : 'N/A'}</span></p>
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
