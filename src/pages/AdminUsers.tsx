import React, { useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Mail, Ban, Trash, Eye, Plus, Download, UserPlus, Filter, Loader2, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiGet, useAuthenticatedApiGet, apiPost } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { CreateAdminDialog } from "@/components/admin/CreateAdminDialog";
import { AdminPermissionsDialog } from "@/components/admin/AdminPermissionsDialog";
import { User } from "@/types/User";

// For display purposes when using API data
const formatUserForDisplay = (user: User): User => {
  return {
    ...user,
    status: user.status || "active",
    orders: user.orders || 0,
    totalSpent: user.totalSpent || 0,
    lastLogin: user.lastLogin || user.updated_at,
    permissions: user.permissions || {
      manage_orders: user.role === "admin",
      manage_products: user.role === "admin",
      manage_categories: user.role === "admin",
      manage_users: user.role === "admin",
      manage_admins: user.role === "admin",
      view_analytics: user.role === "admin"
    }
  };
};

// Mock data - fallback if API fails
const mockUsers: User[] = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    created_at: "2024-01-15",
    status: "active",
    orders: 5,
    totalSpent: 499.99,
    phone: "+1 234-567-8900",
    address: "123 Main St, City, Country",
    lastLogin: "2024-02-22",
    role: "customer",
    permissions: {
      manage_orders: false,
      manage_products: false,
      manage_categories: false,
      manage_users: false,
      manage_admins: false,
      view_analytics: false
    }
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    created_at: "2024-02-01",
    status: "active",
    orders: 3,
    totalSpent: 299.99,
    phone: "+1 234-567-8901",
    address: "456 Oak St, City, Country",
    lastLogin: "2024-02-21",
    role: "customer",
    permissions: {
      manage_orders: true,
      manage_products: true,
      manage_categories: false,
      manage_users: false,
      manage_admins: false,
      view_analytics: true
    }
  },
  {
    id: 3,
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    created_at: "2024-02-15",
    status: "active",
    orders: 0,
    totalSpent: 0,
    phone: "+1 234-567-8902",
    address: "789 Pine St, City, Country",
    lastLogin: "2024-02-20",
    role: "admin",
    permissions: {
      manage_orders: true,
      manage_products: true,
      manage_categories: true,
      manage_users: true,
      manage_admins: true,
      view_analytics: true
    }
  }
];

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
  permissions?: {
    orders: boolean;
    products: boolean;
    categories: boolean;
    users: boolean;
    workers: boolean;
    analytics: boolean;
  };
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [useApiData, setUseApiData] = useState(true);
  const { isAuthenticated, isAdmin } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    role: undefined,
    permissions: undefined
  });

  // Fetch users from the API with authentication
  const { data: apiUsers, loading, error, refetch: refetchUsers } = useAuthenticatedApiGet<User[]>('/users');
  
  // Choose data source: API or mock data
  const users = useApiData && apiUsers && !error 
    ? apiUsers.map(formatUserForDisplay) 
    : mockUsers;

  const filteredUsers = users.filter(user => 
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId: number) => {
    // In a real implementation, this would call an API endpoint to delete the user
    toast.error("Delete functionality not yet implemented");
  };

  const handleToggleStatus = (userId: number) => {
    // In a real implementation, this would call an API endpoint to update the user status
    toast.error("Status toggle functionality not yet implemented");
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call an API endpoint to add a new user
    toast.error("Add user functionality not yet implemented");
    setIsAddingUser(false);
  };

  const handleBulkAction = (action: 'delete' | 'ban' | 'unban') => {
    // In a real implementation, this would call API endpoints to perform bulk actions
    toast.error(`Bulk ${action} functionality not yet implemented`);
    setSelectedUsers([]);
  };

  const handleAdminCreated = () => {
    toast.success("Admin user created successfully");
    refetchUsers();
  };

  const handlePermissionsUpdated = () => {
    toast.success("Permissions updated successfully");
    refetchUsers();
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Join Date", "Status", "Role"];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `${user.first_name || ''} ${user.last_name || ''}`,
        user.email,
        user.created_at || '',
        user.status || 'active',
        user.role || 'customer'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'users.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const getUserName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          
          <div className="flex space-x-2">
            <Button onClick={() => setIsAddingAdmin(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
            
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddWorker} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName">First Name</label>
                      <Input 
                        id="firstName" 
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName">Last Name</label>
                      <Input 
                        id="lastName" 
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone">Phone</label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address">Address</label>
                    <Input 
                      id="address" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All Users</DropdownMenuItem>
              <DropdownMenuItem>Admins</DropdownMenuItem>
              <DropdownMenuItem>Customers</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>Banned</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center space-x-2">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={useApiData} 
                onChange={() => setUseApiData(!useApiData)}
                className="accent-primary h-4 w-4" 
              />
              Use API Data
            </label>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedUsers.length} users selected
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('ban')}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('unban')}
                >
                  Unban
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
            <h3 className="font-bold">API Error</h3>
            <p>{error.message}</p>
            <p className="text-sm">Showing mock data as fallback.</p>
          </div>
        )}

        {!loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{getUserName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.created_at || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'customer'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'banned' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsViewingDetails(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          
                          {user.role === 'admin' && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setIsEditingPermissions(true);
                            }}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Email User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.status === 'banned' ? 'Unban' : 'Ban'} User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </main>

      {/* User details dialog */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                  {selectedUser.first_name?.[0] || ''}{selectedUser.last_name?.[0] || ''}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{getUserName(selectedUser)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{selectedUser.role || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedUser.status || 'Active'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{selectedUser.created_at || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">{selectedUser.lastLogin || selectedUser.updated_at || 'N/A'}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedUser.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Admin Dialog */}
      <CreateAdminDialog 
        isOpen={isAddingAdmin}
        onClose={() => setIsAddingAdmin(false)}
        onAdminCreated={handleAdminCreated}
      />
      
      {/* Admin Permissions Dialog */}
      <AdminPermissionsDialog
        isOpen={isEditingPermissions}
        onClose={() => setIsEditingPermissions(false)}
        user={selectedUser}
        onPermissionsUpdated={handlePermissionsUpdated}
      />
    </div>
  );
}
