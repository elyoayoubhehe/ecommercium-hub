import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNav } from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Edit, Trash, Loader2, Plus } from 'lucide-react';
import { useApiGet, apiPut, apiDelete, apiPost } from '@/hooks/useApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateSharedData } from '@/utils/dataSync';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount?: number;
  status?: 'active' | 'inactive';
  icon?: string;
}

// Fallback mock data if API fails
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    productCount: 150,
    status: 'active'
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Clothing and accessories',
    productCount: 300,
    status: 'active'
  },
  {
    id: 3,
    name: 'Home & Living',
    description: 'Home decor and furniture',
    productCount: 200,
    status: 'inactive'
  }
];

const AdminCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [useApiData, setUseApiData] = useState(true);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });
  const { isAuthenticated, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Fetch categories from API
  const { data: apiCategories, loading, error } = useApiGet<Category[]>('/categories');
  
  // Choose data source: API or mock data
  const categories = useApiData && apiCategories && !error 
    ? apiCategories 
    : mockCategories;

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
    setIsEditingCategory(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (id: number) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to delete categories");
      return;
    }
    
    // First confirm if the user wants to delete
    if (confirm("Are you sure you want to delete this category? This may affect products using this category.")) {
      try {
        console.log(`Deleting category ${id} with token...`);
        
        try {
          await apiDelete(`/categories/${id}`, true);
          toast.success("Category deleted successfully!");
          // Use the simplified function call
          invalidateSharedData('categories');
        } catch (err: any) {
          // Check if this is a foreign key constraint error
          if (err.message && err.message.includes('Cannot delete category that has products')) {
            const errorMessage = "This category has products associated with it. Would you like to view these products first?";
            
            if (confirm(errorMessage)) {
              // Redirect to products page filtered by this category
              navigate(`/admin/products?category=${id}`);
            }
          } else if (err.message && err.message.includes('expired')) {
            // Handle expired token
            toast.error("Your session has expired. Please log in again.");
            // Redirect to login
            navigate('/login');
          } else {
            // Generic error
            toast.error("Failed to delete category: " + (err instanceof Error ? err.message : "Unknown error"));
          }
        }
      } catch (err) {
        toast.error("Failed to delete category: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle update category
  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentCategory) return;
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to update categories");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedCategory = await apiPut(`/categories/${currentCategory.id}`, formData, true) as Category;
      
      toast.success(`Category "${updatedCategory.name}" updated successfully!`);
      setIsEditingCategory(false);
      // Use the simplified function call
      invalidateSharedData('categories');
    } catch (err: any) {
      if (err.message && err.message.includes('expired')) {
        // Handle expired token
        toast.error("Your session has expired. Please log in again.");
        navigate('/login');
      } else {
        toast.error("Failed to update category: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status?: 'active' | 'inactive') => {
    return status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  // Add a new function to handle adding categories
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  const handleInputChangeForNewCategory = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategoryData({ ...newCategoryData, [name]: value });
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to add categories");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiPost('/categories', newCategoryData, true);
      
      toast.success(`Category "${newCategoryData.name}" added successfully!`);
      setIsAddingCategory(false);
      // Reset the form
      setNewCategoryData({
        name: '',
        description: '',
        icon: ''
      });
      // Use the simplified function call
      invalidateSharedData('categories');
    } catch (err: any) {
      if (err.message && err.message.includes('expired')) {
        // Handle expired token
        toast.error("Your session has expired. Please log in again.");
        navigate('/login');
      } else {
        toast.error("Failed to add category: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => setIsAddingCategory(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || 'No description'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(category.status)}`}>
                        {category.status || 'active'}
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
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </main>

      {/* Edit Category Dialog */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="📦"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditingCategory(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newCategoryData.name}
                  onChange={handleInputChangeForNewCategory}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newCategoryData.description}
                  onChange={handleInputChangeForNewCategory}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  name="icon"
                  value={newCategoryData.icon}
                  onChange={handleInputChangeForNewCategory}
                  placeholder="📦"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddingCategory(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;