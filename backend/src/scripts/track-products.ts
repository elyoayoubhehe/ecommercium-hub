import { ScrapingService } from '../services/scrapingService';
import { productsToTrack } from '../data/product-urls';

async function trackAllProducts() {
  const scrapingService = new ScrapingService();
  
  for (const product of productsToTrack) {
    console.log(`Tracking prices for: ${product.name}`);
    
    // Track each URL for the product
    for (const [site, url] of Object.entries(product.urls)) {
      if (!url) continue;
      
      try {
        console.log(`Scraping from ${site}: ${url}`);
        const scrapedProduct = await scrapingService.scrapeProduct(url);
        console.log('Result:', {
          site,
          title: scrapedProduct.title,
          price: scrapedProduct.price,
          availability: scrapedProduct.availability
        });
      } catch (error) {
        console.error(`Error scraping ${site} for ${product.name}:`, error);
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Run the tracking
console.log('Starting price tracking...');
trackAllProducts()
  .then(() => console.log('Finished tracking all products'))
  .catch(error => console.error('Error in tracking process:', error)); 