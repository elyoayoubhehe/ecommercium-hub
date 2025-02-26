export interface ProductCategory {
  name: string;
  urls: {
    amazon?: string;
    ebay?: string;
    walmart?: string;
    aliexpress?: string;
  };
}

export const productsToTrack: ProductCategory[] = [
  {
    name: "iPhone 13 128GB",
    urls: {
      amazon: "https://www.amazon.com/Apple-iPhone-13-128GB-Blue/dp/B09G9HD6PD",
      walmart: "https://www.walmart.com/ip/Apple-iPhone-13-128GB-Blue/974936004",
    }
  },
  {
    name: "Samsung Galaxy S21",
    urls: {
      amazon: "https://www.amazon.com/Samsung-Galaxy-S21-5G-256GB/dp/B08N3BYNDN",
      ebay: "https://www.ebay.com/sch/i.html?_nkw=Samsung+Galaxy+S21",
    }
  },
  // Add more products here
];

// Example of how to add a new product to track
export function addProductToTrack(product: ProductCategory) {
  productsToTrack.push(product);
}

// Example of how to get all URLs for a specific product
export function getProductUrls(productName: string) {
  return productsToTrack.find(p => p.name === productName)?.urls || {};
} 