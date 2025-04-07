import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductsByCategory: (categoryId: string) => Product[];
  searchProducts: (term: string) => Product[];
}

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Smart LED TV',
    description: '55-inch 4K Ultra HD Smart LED TV',
    price: 699.99,
    category: 'Electronics',
    categoryId: '1',
    stock: 50,
    status: 'in-stock',
    image: 'https://via.placeholder.com/300x300?text=Smart+TV',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    description: 'Noise Cancelling Bluetooth Headphones',
    price: 199.99,
    category: 'Electronics',
    categoryId: '1',
    stock: 30,
    status: 'in-stock',
    image: 'https://via.placeholder.com/300x300?text=Headphones',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Cotton T-Shirt',
    description: 'Comfortable Cotton Casual T-Shirt',
    price: 24.99,
    category: 'Fashion',
    categoryId: '2',
    stock: 100,
    status: 'in-stock',
    image: 'https://via.placeholder.com/300x300?text=T-Shirt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Denim Jeans',
    description: 'Classic Fit Denim Jeans',
    price: 59.99,
    category: 'Fashion',
    categoryId: '2',
    stock: 5,
    status: 'low-stock',
    image: 'https://via.placeholder.com/300x300?text=Jeans',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Novel Collection',
    description: 'Bestselling Novel Collection Set',
    price: 49.99,
    category: 'Books',
    categoryId: '4',
    stock: 0,
    status: 'out-of-stock',
    image: 'https://via.placeholder.com/300x300?text=Books',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load products from localStorage or use default
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(defaultProducts);
    }
  }, []);

  useEffect(() => {
    // Save products to localStorage whenever they change
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, ...updatedFields, updatedAt: new Date().toISOString() } 
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId);
  };

  const searchProducts = (term: string) => {
    if (!term) return products;
    
    const searchTerm = term.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <ProductsContext.Provider 
      value={{ 
        products, 
        addProduct, 
        updateProduct, 
        deleteProduct,
        getProductsByCategory,
        searchProducts
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
