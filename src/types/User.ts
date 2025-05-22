export interface UserPermissions {
  id?: number;
  user_id?: number;
  manage_orders: boolean;
  manage_products: boolean;
  manage_categories: boolean;
  manage_users: boolean;
  manage_admins: boolean;
  view_analytics: boolean;
}

export interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'customer' | 'admin';
  created_at?: string;
  updated_at?: string;
  status?: "active" | "banned";
  orders?: number;
  totalSpent?: number;
  phone?: string;
  address?: string;
  lastLogin?: string;
  permissions?: UserPermissions;
}

export const defaultPermissions: UserPermissions = {
  manage_orders: false,
  manage_products: false,
  manage_categories: false,
  manage_users: false,
  manage_admins: false,
  view_analytics: false
};

export const formatUserForDisplay = (user: User): User => {
  return {
    ...user,
    status: user.status || "active",
    orders: user.orders || 0,
    totalSpent: user.totalSpent || 0,
    lastLogin: user.lastLogin || user.updated_at,
    permissions: user.permissions || {
      ...defaultPermissions,
      manage_orders: user.role === "admin",
      manage_products: user.role === "admin",
      manage_categories: user.role === "admin",
      manage_users: user.role === "admin", 
      manage_admins: false, // Only super admins can manage other admins by default
      view_analytics: user.role === "admin"
    }
  };
}; 