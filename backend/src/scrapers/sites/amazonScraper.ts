import { BaseScraper } from '../base';
import { ScrapedProduct } from '../types';

export class AmazonScraper extends BaseScraper {
  async scrapeProduct(url: string): Promise<ScrapedProduct> {
    try {
      await this.initBrowser();
      if (!this.page) throw new Error('Browser initialization failed');

      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.delay(); // Random delay to avoid detection

      const product: ScrapedProduct = {
        title: await this.page.$eval('#productTitle', el => el.textContent?.trim() || ''),
        price: await this.extractPrice(),
        description: await this.page.$eval('#productDescription', el => el.textContent?.trim() || ''),
        imageUrl: await this.page.$eval('#landingImage', img => img.getAttribute('src') || ''),
        sourceUrl: url,
        sourceSite: 'amazon',
        timestamp: new Date(),
        availability: await this.checkAvailability(),
        specifications: await this.extractSpecifications(),
      };

      await this.cleanup();
      return product;
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  private async extractPrice(): Promise<number> {
    const priceElement = await this.page?.$('.a-price-whole');
    const priceText = await priceElement?.textContent();
    return parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
  }

  private async checkAvailability(): Promise<boolean> {
    const availability = await this.page?.$('#availability');
    const text = await availability?.textContent();
    return text?.toLowerCase().includes('in stock') || false;
  }

  private async extractSpecifications(): Promise<Record<string, string>> {
    const specs: Record<string, string> = {};
    const rows = await this.page?.$$('#productDetails_techSpec_section_1 tr');
    
    if (rows) {
      for (const row of rows) {
        const key = await row.$eval('th', el => el.textContent?.trim() || '');
        const value = await row.$eval('td', el => el.textContent?.trim() || '');
        if (key && value) {
          specs[key] = value;
        }
      }
    }
    
    return specs;
  }
} 