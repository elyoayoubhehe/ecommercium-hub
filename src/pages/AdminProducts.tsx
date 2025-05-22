import { useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiGet, useAuthenticatedApiGet, apiPost, apiPut, apiDelete } from "@/hooks/useApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Edit } from "lucide-react";
import { invalidateSharedData } from '@/utils/dataSync';
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  category_id: number;
  category?: string;
  image_url?: string;
  status?: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
  image_url: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
}

// Function to determine product status based on stock quantity
const getProductStatus = (stockQuantity?: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (stockQuantity === undefined || stockQuantity === null) return 'out-of-stock';
  if (stockQuantity <= 0) return 'out-of-stock';
  if (stockQuantity < 10) return 'low-stock';
  return 'in-stock';
};

// Mock products as fallback
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Wireless Earbuds',
    category: 'Electronics',
    category_id: 1,
    price: 99.99,
    stock_quantity: 50,
    status: 'in-stock'
  },
  {
    id: 2,
    name: 'Leather Wallet',
    category: 'Accessories',
    category_id: 2,
    price: 49.99,
    stock_quantity: 5,
    status: 'low-stock'
  },
  {
    id: 3,
    name: 'Running Shoes',
    category: 'Footwear',
    category_id: 3,
    price: 129.99,
    stock_quantity: 0,
    status: 'out-of-stock'
  }
];

const AdminProducts = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [useApiData, setUseApiData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    image_url: ''
  });
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: ''
  });
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch products and categories from API
  const { 
    data: apiProducts, 
    loading: loadingProducts, 
    error: productsError 
  } = useApiGet<Product[]>('/products');
  
  const { 
    data: apiCategories, 
    loading: loadingCategories, 
    error: categoriesError 
  } = useApiGet<Category[]>('/categories');

  const loading = loadingProducts || loadingCategories;
  const error = productsError || categoriesError;

  // Choose which data to use: API or mock
  const products = useApiData && apiProducts && !error 
    ? apiProducts.map(product => ({
        ...product,
        status: getProductStatus(product.stock_quantity)
      }))
    : mockProducts;
  
  const categories = useApiData && apiCategories && !error 
    ? apiCategories 
    : [];

  const queryClient = useQueryClient();

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductCategoryChange = (value: string) => {
    setProductFormData(prev => ({ ...prev, category_id: value }));
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to add products");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        price: parseFloat(productFormData.price),
        stock_quantity: parseInt(productFormData.stock_quantity),
        category_id: parseInt(productFormData.category_id),
        image_url: productFormData.image_url
      };
      
      await apiPost('/products', productData, true);
      
      toast.success(`Product "${productData.name}" added successfully!`);
      setIsAddingProduct(false);
      // Reset form
      setProductFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        image_url: ''
      });
      
      // Invalidate both product and category data to ensure synchronization
      invalidateSharedData('products');
      
    } catch (err) {
      if (err instanceof Error && err.message.includes('expired')) {
        toast.error("Your session has expired. Please log in again.");
        navigate('/login');
      } else {
        toast.error("Failed to add product: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to add categories");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
    const newCategory = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        icon: categoryFormData.icon
      };
      
      // Call API to add category
      await apiPost('/categories', newCategory, true);
      
      toast.success("Category added successfully!");
    setIsAddingCategory(false);
      
      // Reset form
      setCategoryFormData({
        name: '',
        description: '',
        icon: ''
      });
      
      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      toast.error("Failed to add category: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to delete products");
      return;
    }
    
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await apiDelete(`/products/${productId}`, true);
        toast.success("Product deleted successfully!");
        
        // Invalidate products data on both admin and client sides
        invalidateSharedData('products');
      } catch (err) {
        if (err instanceof Error && err.message.includes('expired')) {
          toast.error("Your session has expired. Please log in again.");
          navigate('/login');
        } else {
          toast.error("Failed to delete product: " + (err instanceof Error ? err.message : "Unknown error"));
        }
      }
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to delete categories");
      return;
    }
    
    if (confirm("Are you sure you want to delete this category? This may affect products using this category.")) {
      try {
        // Use the new apiDelete function
        await apiDelete(`/categories/${categoryId}`, true);
        
        toast.success("Category deleted successfully!");
        
        // Refresh categories list
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } catch (error) {
        toast.error("Failed to delete category: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProductId(product.id);
    setProductFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_quantity: (product.stock_quantity || 0).toString(),
      category_id: product.category_id.toString(),
      image_url: product.image_url || ""
    });
    setIsEditingProduct(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentProductId) {
      toast.error("No product selected for editing");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        price: parseFloat(productFormData.price),
        stock_quantity: parseInt(productFormData.stock_quantity),
        category_id: parseInt(productFormData.category_id),
        image_url: productFormData.image_url
      };
      
      await apiPut(`/products/${currentProductId}`, productData, true);
      
      toast.success(`Product "${productData.name}" updated successfully!`);
      setIsEditingProduct(false);
      
      // Invalidate products data on both admin and client sides
      invalidateSharedData('products');
    } catch (err) {
      if (err instanceof Error && err.message.includes('expired')) {
        toast.error("Your session has expired. Please log in again.");
        navigate('/login');
      } else {
        toast.error("Failed to update product: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategoryId(category.id);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || ""
    });
    setIsEditingCategory(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as admin to update categories");
      return;
    }
    
    if (!currentCategoryId) {
      toast.error("No category selected for editing");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the new apiPut function
      const updatedCategory = await apiPut(`/categories/${currentCategoryId}`, {
        name: categoryFormData.name,
        description: categoryFormData.description,
        icon: categoryFormData.icon
      }, true);
      
      toast.success(`Category "${updatedCategory.name}" updated successfully!`);
      
      // Reset form and close dialog
      setCategoryFormData({
        name: "",
        description: "",
        icon: ""
      });
      setCurrentCategoryId(null);
      setIsEditingCategory(false);
      
      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      toast.error("Failed to update category: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
    }
  };

  // Get category name by id
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
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

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Products Management</h2>
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={productFormData.name}
                        onChange={handleProductInputChange}
                        placeholder="Enter product name" 
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                        <Input 
                          id="price" 
                          name="price"
                          value={productFormData.price}
                          onChange={handleProductInputChange}
                          type="number" 
                          step="0.01"
                          min="0.01"
                          placeholder="99.99" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input 
                          id="stock_quantity" 
                          name="stock_quantity"
                          value={productFormData.stock_quantity}
                          onChange={handleProductInputChange}
                          type="number" 
                          min="0"
                          placeholder="100" 
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category</Label>
                      <Select 
                        value={productFormData.category_id} 
                        onValueChange={handleProductCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        value={productFormData.description}
                        onChange={handleProductInputChange}
                        placeholder="Enter product description" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input 
                        id="image_url" 
                        name="image_url"
                        value={productFormData.image_url}
                        onChange={handleProductInputChange}
                        placeholder="https://example.com/image.jpg" 
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setIsAddingProduct(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Product'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                <Card key={product.id} className="p-4">
                    <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <div className="text-sm font-medium">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                            {product.status?.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.description || 'No description available'}
                      </p>
                      <div className="text-sm">Category: {getCategoryName(product.category_id)}</div>
                      <div className="text-sm">Stock: {product.stock_quantity || 0}</div>
                      <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4" />
                      </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                        <Trash className="w-4 h-4" />
                      </Button>
                        </div>
                    </div>
                  </div>
                </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Categories Management</h2>
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
                  <form onSubmit={handleAddCategory} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={categoryFormData.name}
                        onChange={handleCategoryInputChange}
                        placeholder="Enter category name" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        value={categoryFormData.description}
                        onChange={handleCategoryInputChange}
                        placeholder="Enter category description"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon (emoji)</Label>
                      <Input 
                        id="icon" 
                        name="icon" 
                        value={categoryFormData.icon}
                        onChange={handleCategoryInputChange}
                        placeholder="Enter an emoji icon" 
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setIsAddingCategory(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Add Category'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {categories.length > 0 ? (
                categories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon || '📦'}</span>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                          size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No categories found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add the Edit Product Dialog */}
      <Dialog open={isEditingProduct} onOpenChange={setIsEditingProduct}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                name="name"
                value={productFormData.name}
                onChange={handleProductInputChange}
                placeholder="Enter product name" 
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  name="price"
                  value={productFormData.price}
                  onChange={handleProductInputChange}
                  type="number" 
                  step="0.01"
                  min="0.01"
                  placeholder="99.99" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input 
                  id="stock_quantity" 
                  name="stock_quantity"
                  value={productFormData.stock_quantity}
                  onChange={handleProductInputChange}
                  type="number" 
                  min="0"
                  placeholder="100" 
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select 
                value={productFormData.category_id} 
                onValueChange={handleProductCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                name="description"
                value={productFormData.description}
                onChange={handleProductInputChange}
                placeholder="Enter product description"
                className="min-h-[100px] w-full border rounded-md p-2"
              ></textarea>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url" 
                name="image_url"
                value={productFormData.image_url}
                onChange={handleProductInputChange}
                placeholder="https://example.com/image.jpg" 
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditingProduct(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add the Edit Category Dialog */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input 
                id="edit-category-name" 
                name="name"
                value={categoryFormData.name}
                onChange={handleCategoryInputChange}
                placeholder="Enter category name" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <textarea 
                id="edit-category-description" 
                name="description"
                value={categoryFormData.description}
                onChange={handleCategoryInputChange}
                placeholder="Enter category description"
                className="min-h-[100px] w-full border rounded-md p-2"
              ></textarea>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-icon">Icon (emoji)</Label>
              <Input 
                id="edit-category-icon" 
                name="icon"
                value={categoryFormData.icon}
                onChange={handleCategoryInputChange}
                placeholder="📦"
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditingCategory(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;