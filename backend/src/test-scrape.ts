import { ScrapingService } from './services/scrapingService';

const testUrls = {
  amazon: [
    // Example Amazon product URLs
    'https://www.amazon.com/Apple-iPhone-13-128GB-Blue/dp/B09G9HD6PD', // iPhone
    'https://www.amazon.com/Samsung-Smartphone-Unlocked-Smartphone-Long-Lasting/dp/B09BFTMQH9', // Samsung
  ],
  ebay: [
    // Example eBay product URLs
    'https://www.ebay.com/itm/123456789', // Replace with actual eBay product URLs
  ],
  walmart: [
    // Example Walmart product URLs
    'https://www.walmart.com/ip/123456789', // Replace with actual Walmart product URLs
  ],
  aliexpress: [
    // Example AliExpress product URLs
    'https://www.aliexpress.com/item/123456789.html', // Replace with actual AliExpress product URLs
  ]
};

async function testScraping() {
  const scrapingService = new ScrapingService();

  // Test Amazon scraping
  console.log('Testing Amazon scraping...');
  for (const url of testUrls.amazon) {
    try {
      const product = await scrapingService.scrapeProduct(url);
      console.log('Successfully scraped product:', {
        title: product.title,
        price: product.price,
        availability: product.availability
      });
    } catch (error) {
      console.error('Error scraping product:', url, error);
    }
  }
}

// Run the test
testScraping().catch(console.error); 