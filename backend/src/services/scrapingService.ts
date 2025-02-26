import { createClient } from '@supabase/supabase-js';
import { ScrapedProduct, ScrapingJob, SupportedSites } from '../scrapers/types';
import { AmazonScraper } from '../scrapers/sites/amazonScraper';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export class ScrapingService {
  private scrapers: Map<SupportedSites, any> = new Map([
    ['amazon', new AmazonScraper()],
    // Add more scrapers here
  ]);

  async scrapeProduct(url: string): Promise<ScrapedProduct> {
    const site = this.detectSite(url);
    const scraper = this.scrapers.get(site);
    
    if (!scraper) {
      throw new Error(`No scraper available for ${site}`);
    }

    const product = await scraper.scrapeProduct(url);
    await this.saveProduct(product);
    return product;
  }

  private detectSite(url: string): SupportedSites {
    if (url.includes('amazon')) return 'amazon';
    if (url.includes('ebay')) return 'ebay';
    if (url.includes('aliexpress')) return 'aliexpress';
    if (url.includes('walmart')) return 'walmart';
    throw new Error('Unsupported site');
  }

  private async saveProduct(product: ScrapedProduct): Promise<void> {
    const { error } = await supabase
      .from('products')
      .upsert({
        ...product,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async findBestOffers(productTitle: string): Promise<ScrapedProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('title', `%${productTitle}%`)
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  }

  async trackProduct(url: string): Promise<void> {
    const { error } = await supabase
      .from('tracking_jobs')
      .insert({
        product_url: url,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }
} 