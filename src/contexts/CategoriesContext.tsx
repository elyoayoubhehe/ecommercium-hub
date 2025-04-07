import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface CategoriesContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
}

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    icon: 'cpu',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    icon: 'shirt',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Home & Living',
    description: 'Furniture and home decor',
    icon: 'sofa',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Books',
    description: 'Books across all genres',
    icon: 'book-open',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Load categories from localStorage or use default
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(defaultCategories);
    }
  }, []);

  useEffect(() => {
    // Save categories to localStorage whenever they change
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(categories.map(category => 
      category.id === id 
        ? { ...category, ...updatedFields, updatedAt: new Date().toISOString() } 
        : category
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getCategoryByName = (name: string) => {
    return categories.find(category => 
      category.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <CategoriesContext.Provider 
      value={{ 
        categories, 
        addCategory, 
        updateCategory, 
        deleteCategory,
        getCategoryById,
        getCategoryByName
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
