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
import { useState } from "react";
import { Search, MoreVertical, Mail, Ban, Trash, Eye, Plus, Download, UserPlus, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: "active" | "banned";
  orders: number;
  totalSpent: number;
  phone?: string;
  address?: string;
  lastLogin?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "WORKER" | "CUSTOMER";
  permissions: {
    orders: boolean;
    products: boolean;
    categories: boolean;
    users: boolean;
    workers: boolean;
    analytics: boolean;
  };
}

// Mock data - replace with real data later
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    joinDate: "2024-01-15",
    status: "active",
    orders: 5,
    totalSpent: 499.99,
    phone: "+1 234-567-8900",
    address: "123 Main St, City, Country",
    lastLogin: "2024-02-22",
    role: "CUSTOMER",
    permissions: {
      orders: false,
      products: false,
      categories: false,
      users: false,
      workers: false,
      analytics: false
    }
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    joinDate: "2024-02-01",
    status: "active",
    orders: 3,
    totalSpent: 299.99,
    phone: "+1 234-567-8901",
    address: "456 Oak St, City, Country",
    lastLogin: "2024-02-21",
    role: "WORKER",
    permissions: {
      orders: true,
      products: true,
      categories: false,
      users: false,
      workers: false,
      analytics: true
    }
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    joinDate: "2024-02-15",
    status: "banned",
    orders: 1,
    totalSpent: 99.99,
    phone: "+1 234-567-8902",
    address: "789 Pine St, City, Country",
    lastLogin: "2024-02-20",
    role: "ADMIN",
    permissions: {
      orders: true,
      products: true,
      categories: true,
      users: true,
      workers: true,
      analytics: true
    }
  }
];

export const usersState = {
  users: mockUsers,
  setUsers: null as any
};

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: "ADMIN" | "WORKER";
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: undefined,
    permissions: undefined
  });

  // Use React Query to manage users state
  const { data: users = mockUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersState.users,
    initialData: usersState.users
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId: string) => {
    const newUsers = users.filter(user => user.id !== userId);
    if (usersState.setUsers) {
      usersState.setUsers(newUsers);
      toast.success("User deleted successfully");
    }
  };

  const handleToggleStatus = (userId: string) => {
    const newUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "banned" : "active" }
        : user
    );
    if (usersState.setUsers) {
      usersState.setUsers(newUsers);
      toast.success("User status updated");
    }
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      status: "active",
      orders: 0,
      totalSpent: 0,
      lastLogin: new Date().toISOString().split('T')[0],
      role: formData.role || "WORKER",
      permissions: formData.permissions || {
        orders: false,
        products: false,
        categories: false,
        users: false,
        workers: false,
        analytics: false
      }
    };
    
    if (usersState.setUsers) {
      usersState.setUsers([...users, newUser]);
      setIsAddingUser(false);
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        address: "",
        role: undefined,
        permissions: undefined
      });
      toast.success("Worker added successfully");
    }
  };

  const handleBulkAction = (action: 'delete' | 'ban' | 'unban') => {
    let newUsers = [...users];
    
    if (action === 'delete') {
      newUsers = users.filter(user => !selectedUsers.includes(user.id));
      toast.success("Selected users deleted");
    } else {
      newUsers = users.map(user => 
        selectedUsers.includes(user.id)
          ? { ...user, status: action === 'ban' ? 'banned' : 'active' }
          : user
      );
      toast.success(`Selected users ${action}ned`);
    }

    if (usersState.setUsers) {
      usersState.setUsers(newUsers);
      setSelectedUsers([]);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Join Date", "Status", "Orders", "Total Spent", "Phone", "Address", "Last Login"];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.joinDate,
        user.status,
        user.orders,
        user.totalSpent,
        user.phone || "",
        user.address || "",
        user.lastLogin || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users exported to CSV");
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddWorker} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label>Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Role</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={formData.role}
                      onChange={(e) => setFormData({
                        ...formData, 
                        role: e.target.value as "ADMIN" | "WORKER"
                      })}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="WORKER">Worker</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label>Permissions</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={formData.permissions?.orders}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: checked as boolean
                            }
                          })}
                        />
                        <label>Manage Orders</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={formData.permissions?.products}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              products: checked as boolean
                            }
                          })}
                        />
                        <label>Manage Products</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={formData.permissions?.categories}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              categories: checked as boolean
                            }
                          })}
                        />
                        <label>Manage Categories</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={formData.permissions?.analytics}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              analytics: checked as boolean
                            }
                          })}
                        />
                        <label>View Analytics</label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Worker</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between">
              <span>{selectedUsers.length} users selected</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleBulkAction('ban')}>
                  Ban Selected
                </Button>
                <Button variant="outline" onClick={() => handleBulkAction('unban')}>
                  Unban Selected
                </Button>
                <Button variant="destructive" onClick={() => handleBulkAction('delete')}>
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === "active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.orders}</TableCell>
                  <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="flex items-center gap-2"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewingDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-yellow-600"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          <Ban className="h-4 w-4" />
                          {user.status === "active" ? "Ban User" : "Unban User"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash className="h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Contact Information</h4>
                  <p>Phone: {selectedUser.phone || 'N/A'}</p>
                  <p>Address: {selectedUser.address || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Account Information</h4>
                  <p>Join Date: {new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                  <p>Last Login: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'N/A'}</p>
                  <p>Status: {selectedUser.status}</p>
                  <p>Role: {selectedUser.role}</p>
                </div>
                {selectedUser.role !== 'CUSTOMER' && (
                  <div>
                    <h4 className="font-semibold">Permissions</h4>
                    <ul className="list-disc list-inside">
                      {Object.entries(selectedUser.permissions).map(([key, value]) => (
                        <li key={key} className={value ? 'text-green-600' : 'text-red-600'}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value ? '✓' : '✗'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedUser.role === 'CUSTOMER' && (
                  <div>
                    <h4 className="font-semibold">Order History</h4>
                    <p>Total Orders: {selectedUser.orders}</p>
                    <p>Total Spent: ${selectedUser.totalSpent.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
