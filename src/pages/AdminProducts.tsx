import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { AdminNav } from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash, Layout, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts, Product } from "@/contexts/ProductsContext";
import { useCategories, Category } from "@/contexts/CategoriesContext";

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedTab, setSelectedTab] = useState("products");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [editProductImage, setEditProductImage] = useState<string | null>(null);
  
  // Refs for form fields
  const productFormRef = useRef<HTMLFormElement>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const editCategoryFormRef = useRef<HTMLFormElement>(null);
  
  // Handle image upload preview
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, setImagePreview: (preview: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  // Convert data URL to blob for storage
  const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };
  
  // Handle adding a new product
  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    
    if (!productFormRef.current) return;
    
    const formData = new FormData(productFormRef.current);
    const productName = formData.get('name') as string;
    const productPrice = parseFloat(formData.get('price') as string);
    const productDescription = formData.get('description') as string;
    const productCategory = formData.get('category') as string;
    const productStock = parseInt(formData.get('stock') as string || '0');
    
    if (!productName || !productCategory) {
      toast.error("Product name and category are required");
      return;
    }
    
    // Find category ID by name
    const category = categories.find(c => c.id === productCategory);
    
    if (!category) {
      toast.error("Please select a valid category");
      return;
    }
    
    const status = productStock > 10 ? 'in-stock' : productStock > 0 ? 'low-stock' : 'out-of-stock';
    
    // Use the image preview if available, otherwise use a placeholder
    const imageToUse = productImage || '/products/placeholder.jpg';
    
    addProduct({
      name: productName,
      description: productDescription,
      price: productPrice,
      category: category.name,
      categoryId: category.id,
      stock: productStock,
      status,
      image: imageToUse,
    });
    
    toast.success("Product added successfully");
    setIsAddingProduct(false);
    setProductImage(null);
  };
  
  // Handle adding a new category
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

  // Handle editing a category
  const handleEditCategory = (e: FormEvent) => {
    e.preventDefault();
    
    if (!editCategoryFormRef.current || !editingCategory) return;
    
    const formData = new FormData(editCategoryFormRef.current);
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
  
  // Handle editing a product
  const handleEditProduct = (e: FormEvent) => {
    e.preventDefault();
    
    if (!productFormRef.current || !selectedProduct) return;
    
    const formData = new FormData(productFormRef.current);
    const productName = formData.get('name') as string;
    const productPrice = parseFloat(formData.get('price') as string);
    const productDescription = formData.get('description') as string;
    const productCategory = formData.get('category') as string;
    const productStock = parseInt(formData.get('stock') as string || '0');
    
    // Find category ID by name
    const category = categories.find(c => c.id === productCategory);
    
    if (!category) {
      toast.error("Please select a valid category");
      return;
    }
    
    const status = productStock > 10 ? 'in-stock' : productStock > 0 ? 'low-stock' : 'out-of-stock';
    
    // Use the edited image preview if available, otherwise use the existing image
    const imageToUse = editProductImage || selectedProduct.image;
    
    updateProduct(selectedProduct.id, {
      name: productName,
      description: productDescription,
      price: productPrice,
      category: category.name,
      categoryId: category.id,
      stock: productStock,
      status,
      image: imageToUse,
    });
    
    toast.success("Product updated successfully");
    setSelectedProduct(null);
    setEditProductImage(null);
  };
  
  // Handle deleting a product
  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.success("Product deleted successfully");
  };

  // Handle deleting a category
  const handleDeleteCategory = (id: string) => {
    // Check if any products are using this category
    const productsUsingCategory = products.filter(product => product.categoryId === id);
    
    if (productsUsingCategory.length > 0) {
      toast.error(`Cannot delete category. It is used by ${productsUsingCategory.length} products.`);
      return;
    }
    
    deleteCategory(id);
    toast.success("Category deleted successfully");
  };
  
  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center sticky top-0 z-10 bg-background py-3 border-b">
              <h2 className="text-3xl font-bold">Products Management</h2>
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form ref={productFormRef} onSubmit={handleAddProduct} className="space-y-4 mt-4 px-1">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" name="name" placeholder="Enter product name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="99.99" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input id="stock" name="stock" type="number" placeholder="100" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Select name="category" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsAddingProduct(false);
                            setTimeout(() => {
                              setIsAddingCategory(true);
                              setSelectedTab("categories");
                            }, 100);
                          }}
                        >
                          Add New
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Enter product description" className="h-20" rows={3} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Product Image</Label>
                      <div className="flex items-start gap-4 border border-gray-200 p-2 rounded-md">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt="Preview" 
                              className="w-full h-full object-contain" 
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input 
                            id="image" 
                            name="image" 
                            type="file" 
                            accept="image/*" 
                            className="text-sm" 
                            onChange={(e) => handleImageChange(e, setProductImage)}
                          />
                          {productImage && (
                            <Button 
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setProductImage(null)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="mt-4">
                      <Button variant="outline" type="button" onClick={() => setIsAddingProduct(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Product</Button>
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
                    <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                      {product.image && product.image !== '/products/placeholder.jpg' ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description || "No description provided."}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(product);
                            // Add edit functionality here
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-muted-foreground">No products found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsAddingProduct(true)}
                  >
                    Add your first product
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center sticky top-0 z-10 bg-background py-3 border-b">
              <h2 className="text-3xl font-bold">Categories Management</h2>
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <form ref={categoryFormRef} onSubmit={handleAddCategory} className="space-y-4 mt-4 px-1">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {categories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description || "No description provided."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.status}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-muted-foreground">No categories found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    Add your first category
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Edit Category Dialog */}
        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <form ref={editCategoryFormRef} onSubmit={handleEditCategory} className="space-y-4 mt-4 px-1">
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
        
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form ref={productFormRef} onSubmit={handleEditProduct} className="space-y-4 mt-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  defaultValue={selectedProduct?.name}
                  placeholder="Enter product name" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price *</Label>
                  <Input 
                    id="edit-price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    defaultValue={selectedProduct?.price}
                    placeholder="99.99" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock *</Label>
                  <Input 
                    id="edit-stock" 
                    name="stock" 
                    type="number" 
                    defaultValue={selectedProduct?.stock}
                    placeholder="100" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedProduct?.description}
                  placeholder="Enter product description" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Product Image</Label>
                <div className="flex items-start gap-4 border border-gray-200 p-2 rounded-md">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                    {editProductImage || (selectedProduct?.image && selectedProduct.image !== '/products/placeholder.jpg') ? (
                      <img 
                        src={editProductImage || selectedProduct?.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      id="edit-image" 
                      name="image" 
                      type="file" 
                      accept="image/*" 
                      className="text-sm" 
                      onChange={(e) => handleImageChange(e, setEditProductImage)}
                    />
                    {(editProductImage || (selectedProduct?.image && selectedProduct.image !== '/products/placeholder.jpg')) && (
                      <Button 
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setEditProductImage(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminProducts;