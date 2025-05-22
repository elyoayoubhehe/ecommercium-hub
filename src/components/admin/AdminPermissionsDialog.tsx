import React, { useState, useEffect } from 'react';
import { User, UserPermissions } from '@/types/User';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiPut } from '@/hooks/useApi';

interface AdminPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onPermissionsUpdated: () => void;
}

export function AdminPermissionsDialog({ 
  isOpen, 
  onClose, 
  user, 
  onPermissionsUpdated 
}: AdminPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserPermissions>({
    manage_orders: false,
    manage_products: false,
    manage_categories: false,
    manage_users: false,
    manage_admins: false,
    view_analytics: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update permissions state when user changes
  useEffect(() => {
    if (user && user.permissions) {
      setPermissions({
        manage_orders: !!user.permissions.manage_orders,
        manage_products: !!user.permissions.manage_products,
        manage_categories: !!user.permissions.manage_categories,
        manage_users: !!user.permissions.manage_users,
        manage_admins: !!user.permissions.manage_admins,
        view_analytics: !!user.permissions.view_analytics,
      });
    }
  }, [user]);

  const handleTogglePermission = (permission: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await apiPut(`/permissions/${user.id}`, permissions, true);
      toast.success(`Permissions updated for ${user.first_name} ${user.last_name}`);
      onPermissionsUpdated();
      onClose();
    } catch (error) {
      toast.error(`Failed to update permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Manage Permissions for {user.first_name} {user.last_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manage_orders" className="flex-1">Manage Orders</Label>
              <Switch
                id="manage_orders"
                checked={permissions.manage_orders}
                onCheckedChange={() => handleTogglePermission('manage_orders')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Can view, update, and process customer orders
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manage_products" className="flex-1">Manage Products</Label>
              <Switch
                id="manage_products"
                checked={permissions.manage_products}
                onCheckedChange={() => handleTogglePermission('manage_products')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Can create, edit, and delete products
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manage_categories" className="flex-1">Manage Categories</Label>
              <Switch
                id="manage_categories"
                checked={permissions.manage_categories}
                onCheckedChange={() => handleTogglePermission('manage_categories')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Can create, edit, and delete product categories
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manage_users" className="flex-1">Manage Users</Label>
              <Switch
                id="manage_users"
                checked={permissions.manage_users}
                onCheckedChange={() => handleTogglePermission('manage_users')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Can view and manage customer accounts
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manage_admins" className="flex-1">Manage Admins</Label>
              <Switch
                id="manage_admins"
                checked={permissions.manage_admins}
                onCheckedChange={() => handleTogglePermission('manage_admins')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Can create new admin users and manage their permissions
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="view_analytics" className="flex-1">View Analytics</Label>
              <Switch
                id="view_analytics"
                checked={permissions.view_analytics}
                onCheckedChange={() => handleTogglePermission('view_analytics')}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Can access sales reports and analytics data
            </p>
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
                Saving...
              </>
            ) : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 