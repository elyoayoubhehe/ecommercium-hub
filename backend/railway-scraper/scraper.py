import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import time
import random
import logging
import json
import os
from requests.exceptions import RequestException
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def scrape_amazon(search_term, max_retries=3, proxy_list=None, save_images=False, image_folder="images"):
    """
    Scrape Amazon search results with improved error handling and image extraction
    """
    # Configure headers with rotating user agents
    ua = UserAgent()
    
    # Format the search URL properly
    search_url = f"https://www.amazon.com/s?k={search_term.replace(' ', '+')}"
    logger.info(f"Scraping: {search_url}")
    
    # Initialize proxy rotation if provided
    if not proxy_list:
        proxy_list = [None]  # Use direct connection if no proxies
    
    # Create image folder if saving images
    if save_images and not os.path.exists(image_folder):
        os.makedirs(image_folder)
        logger.info(f"Created image folder: {image_folder}")
    
    products_data = []
    attempts = 0
    
    while attempts < max_retries:
        try:
            # Rotate user agents and proxies
            headers = {
                'User-Agent': ua.random,
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
                'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
            
            # Select a proxy randomly from the list
            current_proxy = random.choice(proxy_list)
            proxies = None
            if current_proxy:
                proxies = {
                    'http': f'http://{current_proxy}',
                    'https': f'http://{current_proxy}'
                }
                logger.info(f"Using proxy: {current_proxy}")
            
            # Add delay with jitter to mimic human behavior
            delay = random.uniform(2, 5)
            logger.info(f"Waiting for {delay:.2f} seconds")
            time.sleep(delay)
            
            # Make the request
            response = requests.get(
                search_url, 
                headers=headers, 
                proxies=proxies, 
                timeout=15
            )
            
            # Check for HTTP errors
            response.raise_for_status()
            
            # Check for CAPTCHA or robot check pages
            if any(block_indicator in response.text.lower() for block_indicator in ["captcha", "robot check", "verify you're a human"]):
                logger.warning("CAPTCHA or robot check detected!")
                attempts += 1
                if attempts < max_retries:
                    logger.info(f"Retrying ({attempts}/{max_retries})...")
                    continue
                else:
                    logger.error("Maximum retry attempts reached")
                    return products_data
            
            # Success - parse the content
            logger.info("Request successful, parsing content")
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all product containers
            product_selectors = [
                {'data-component-type': 's-search-result'},
                {'class': 's-result-item'},
                {'class': 'sg-col-4-of-12'}
            ]
            
            products = []
            for selector in product_selectors:
                found_products = soup.find_all('div', selector)
                if found_products:
                    products = found_products
                    break
            
            logger.info(f"Found {len(products)} products")
            
            # Extract product details
            for i, product in enumerate(products, 1):
                try:
                    # Title extraction
                    title_element = (
                        product.find('h2') or 
                        product.find('span', {'class': 'a-text-normal'}) or
                        product.find('h5')
                    )
                    title = title_element.text.strip() if title_element else "N/A"
                    
                    # Price extraction
                    price_element = (
                        product.find('span', {'class': 'a-offscreen'}) or
                        product.find('span', {'class': 'a-price-whole'})
                    )
                    price = price_element.text.strip() if price_element else "N/A"
                    
                    # ASIN extraction
                    asin = product.get('data-asin', "N/A")
                    
                    # Rating extraction
                    rating_element = (
                        product.find('span', {'class': 'a-icon-alt'}) or
                        product.find('i', {'class': 'a-icon-star'})
                    )
                    rating = rating_element.text.strip() if rating_element else "N/A"
                    
                    # Image URL extraction
                    img_url = "N/A"
                    img_element = product.find('img', {'class': 's-image'})
                    if img_element and 'src' in img_element.attrs:
                        img_url = img_element['src']
                    
                    # Product URL extraction
                    product_url = "N/A"
                    link_element = product.find('a', {'class': 'a-link-normal s-no-outline'})
                    if link_element and 'href' in link_element.attrs:
                        product_url = urljoin('https://www.amazon.com', link_element['href'])
                    
                    # Reviews extraction
                    reviews_element = product.find('span', {'class': 'a-size-base'})
                    reviews = reviews_element.text.strip() if reviews_element else "N/A"
                    
                    product_data = {
                        'title': title,
                        'price': price,
                        'asin': asin,
                        'rating': rating,
                        'reviews': reviews,
                        'image_url': img_url,
                        'product_url': product_url
                    }
                    
                    products_data.append(product_data)
                    logger.info(f"Successfully parsed product {i}: {title[:50]}...")
                    
                except Exception as e:
                    logger.error(f"Error extracting product data: {e}")
                    continue
            
            return products_data
            
        except RequestException as e:
            logger.error(f"Request failed: {e}")
            attempts += 1
            if attempts < max_retries:
                logger.info(f"Retrying ({attempts}/{max_retries})...")
            else:
                logger.error("Maximum retry attempts reached")
                return products_data
                
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            attempts += 1
            if attempts < max_retries:
                logger.info(f"Retrying ({attempts}/{max_retries})...")
            else:
                logger.error("Maximum retry attempts reached")
                return products_data 