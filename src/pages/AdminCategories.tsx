import React, { useRef, FormEvent, useState } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, MoreVertical, Edit, Trash, Plus } from 'lucide-react';
import { useCategories, Category } from "@/contexts/CategoriesContext";
import { toast } from 'sonner';

const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormRef.current) return;
    
    const formData = new FormData(categoryFormRef.current);
    const categoryName = formData.get('name') as string;
    const categoryDescription = formData.get('description') as string;
    const categoryIcon = formData.get('icon') as string;
    
    if (!categoryName) {
      toast.error("Category name is required");
      return;
    }
    
    addCategory({
      name: categoryName,
      description: categoryDescription,
      icon: categoryIcon || 'folder',
      status: 'active'
    });
    
    toast.success("Category added successfully");
    setIsAddingCategory(false);
    categoryFormRef.current.reset();
  };

  const handleEditCategory = (e: FormEvent) => {
    e.preventDefault();
    
    if (!editFormRef.current || !editingCategory) return;
    
    const formData = new FormData(editFormRef.current);
    const categoryName = formData.get('name') as string;
    const categoryDescription = formData.get('description') as string;
    const categoryIcon = formData.get('icon') as string;
    const categoryStatus = formData.get('status') as 'active' | 'inactive';
    
    if (!categoryName) {
      toast.error("Category name is required");
      return;
    }
    
    updateCategory(editingCategory.id, {
      name: categoryName,
      description: categoryDescription,
      icon: categoryIcon || editingCategory.icon,
      status: categoryStatus || editingCategory.status
    });
    
    toast.success("Category updated successfully");
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    toast.success("Category deleted successfully");
  };

  const getStatusColor = (status: Category['status']) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form ref={categoryFormRef} onSubmit={handleAddCategory} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input id="name" name="name" placeholder="Enter category name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter category description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input id="icon" name="icon" placeholder="Icon name (e.g., 'shopping-bag')" />
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsAddingCategory(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Category</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(category.status)}`}>
                    {category.status}
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
                      <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-muted-foreground mb-2">No categories found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddingCategory(true)}
                    >
                      Add your first category
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Category Dialog */}
        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <form ref={editFormRef} onSubmit={handleEditCategory} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Category Name *</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={editingCategory.name}
                    placeholder="Enter category name" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    defaultValue={editingCategory.description}
                    placeholder="Enter category description" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-icon">Icon</Label>
                  <Input 
                    id="edit-icon" 
                    name="icon" 
                    defaultValue={editingCategory.icon}
                    placeholder="Icon name (e.g., 'shopping-bag')" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status"
                    name="status"
                    defaultValue={editingCategory.status}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Category</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default AdminCategories;