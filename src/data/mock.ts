export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    description: 'A comfortable and versatile white t-shirt made from 100% cotton.',
    price: 29.99,
    image: '/images/products/white-tshirt.jpg',
    category: 'Clothing',
    rating: 4.5,
    reviews: 128,
    stock: 50,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray']
  },
  {
    id: '2',
    name: 'Leather Crossbody Bag',
    description: 'A stylish leather crossbody bag with multiple compartments.',
    price: 89.99,
    image: '/images/products/leather-bag.jpg',
    category: 'Accessories',
    rating: 4.8,
    reviews: 89,
    stock: 25,
    colors: ['Brown', 'Black', 'Tan']
  },
  {
    id: '3',
    name: 'Running Shoes',
    description: 'Lightweight and comfortable running shoes with superior cushioning.',
    price: 119.99,
    image: '/images/products/running-shoes.jpg',
    category: 'Footwear',
    rating: 4.7,
    reviews: 256,
    stock: 35,
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Blue/White', 'Black/Red', 'Gray/Yellow']
  },
  {
    id: '4',
    name: 'Denim Jacket',
    description: 'A classic denim jacket that never goes out of style.',
    price: 79.99,
    image: '/images/products/denim-jacket.jpg',
    category: 'Clothing',
    rating: 4.6,
    reviews: 167,
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Light Blue']
  },
  {
    id: '5',
    name: 'Smart Watch',
    description: 'A feature-rich smartwatch with fitness tracking capabilities.',
    price: 199.99,
    image: '/images/products/smart-watch.jpg',
    category: 'Electronics',
    rating: 4.4,
    reviews: 203,
    stock: 15,
    colors: ['Black', 'Silver', 'Rose Gold']
  },
  {
    id: '6',
    name: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation.',
    price: 149.99,
    image: '/images/products/wireless-earbuds.jpg',
    category: 'Electronics',
    rating: 4.3,
    reviews: 178,
    stock: 30,
    colors: ['White', 'Black']
  }
];
