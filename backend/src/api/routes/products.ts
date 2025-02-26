import express from 'express';
import { ScrapingService } from '../../services/scrapingService';

const router = express.Router();
const scrapingService = new ScrapingService();

// Get best offers for a product
router.get('/compare/:productTitle', async (req, res) => {
  try {
    const offers = await scrapingService.findBestOffers(req.params.productTitle);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Track a new product
router.post('/track', async (req, res) => {
  try {
    const { url } = req.body;
    await scrapingService.trackProduct(url);
    res.json({ message: 'Product tracking started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track product' });
  }
});

// Manually trigger scraping for a product
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const product = await scrapingService.scrapeProduct(url);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape product' });
  }
});

export default router; 