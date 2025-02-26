from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import scrape_amazon
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.route('/api/search', methods=['GET'])
def search_products():
    try:
        # Get search term from query parameters
        search_term = request.args.get('q', '')
        if not search_term:
            return jsonify({'error': 'Search term is required'}), 400

        # Call the scraper
        products = scrape_amazon(
            search_term=search_term,
            save_images=False  # We don't need to save images for the API
        )

        return jsonify(products)

    except Exception as e:
        logger.error(f"Error in search_products: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True) 