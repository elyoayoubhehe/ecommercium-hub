import React, { useState } from 'react';
import { UserPermissions, defaultPermissions } from '@/types/User';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiPost } from '@/hooks/useApi';
import { Switch } from '@/components/ui/switch';

interface CreateAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminCreated: () => void;
}

export function CreateAdminDialog({
  isOpen,
  onClose,
  onAdminCreated
}: CreateAdminDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  
  const [permissions, setPermissions] = useState<UserPermissions>({
    ...defaultPermissions,
    manage_orders: true,
    manage_products: true,
    manage_categories: true,
    manage_users: true,
    view_analytics: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePermission = (permission: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast.error('All fields are required');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await apiPost('/users/admin', {
        ...formData,
        permissions
      }, true);
      
      toast.success(`Admin user ${formData.first_name} ${formData.last_name} created successfully`);
      onAdminCreated();
      resetForm();
      onClose();
    } catch (error) {
      toast.error(`Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: ''
    });
    setPermissions({
      ...defaultPermissions,
      manage_orders: true,
      manage_products: true,
      manage_categories: true,
      manage_users: true,
      view_analytics: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Admin User</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="John"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Doe"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Administrative Permissions</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="manage_orders" className="flex-1">Manage Orders</Label>
                <Switch
                  id="manage_orders"
                  checked={permissions.manage_orders}
                  onCheckedChange={() => handleTogglePermission('manage_orders')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="manage_products" className="flex-1">Manage Products</Label>
                <Switch
                  id="manage_products"
                  checked={permissions.manage_products}
                  onCheckedChange={() => handleTogglePermission('manage_products')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="manage_categories" className="flex-1">Manage Categories</Label>
                <Switch
                  id="manage_categories"
                  checked={permissions.manage_categories}
                  onCheckedChange={() => handleTogglePermission('manage_categories')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="manage_users" className="flex-1">Manage Users</Label>
                <Switch
                  id="manage_users"
                  checked={permissions.manage_users}
                  onCheckedChange={() => handleTogglePermission('manage_users')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="manage_admins" className="flex-1">Manage Admins</Label>
                <Switch
                  id="manage_admins"
                  checked={permissions.manage_admins}
                  onCheckedChange={() => handleTogglePermission('manage_admins')}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="view_analytics" className="flex-1">View Analytics</Label>
                <Switch
                  id="view_analytics"
                  checked={permissions.view_analytics}
                  onCheckedChange={() => handleTogglePermission('view_analytics')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : 'Create Admin User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 