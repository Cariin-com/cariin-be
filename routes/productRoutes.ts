import express from 'express';
import { ProductService } from '../services/productService';
import { ProductSearchParams } from '../models/Product';

const router = express.Router();
const productService = new ProductService();

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get products with caching logic
 *     description: Fetches products from database if recent, otherwise from FastAPI and caches them
 *     parameters:
 *       - in: query
 *         name: search_query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for products
 *       - in: query
 *         name: max_products
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of products to fetch
 *       - in: query
 *         name: all_pages
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to scrape all pages
 *       - in: query
 *         name: max_workers
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Maximum number of workers for scraping
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: string
 *                   sku:
 *                     type: string
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   specs:
 *                     type: object
 *                   availability:
 *                     type: string
 *                   estimate:
 *                     type: string
 *                   store_info:
 *                     type: string
 *                   warranty:
 *                     type: string
 *                   src:
 *                     type: string
 *                     description: URL sumber scraping
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const { search_query, max_products, all_pages, max_workers } = req.query;
    
    // Validate required parameters
    if (!search_query || typeof search_query !== 'string') {
      return res.status(400).json({
        error: 'search_query is required and must be a string'
      });
    }

    const params: ProductSearchParams = {
      search_query,
      max_products: max_products ? parseInt(max_products as string) : 10,
      all_pages: all_pages === 'true',
      max_workers: max_workers ? parseInt(max_workers as string) : 8
    };

    const products = await productService.getProducts(params);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      message: 'Products retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error in product route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/product/force-update:
 *   post:
 *     summary: Force update products from FastAPI
 *     description: Forces a fresh fetch from FastAPI and updates the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search_query:
 *                 type: string
 *                 required: true
 *               max_products:
 *                 type: integer
 *                 default: 10
 *               all_pages:
 *                 type: boolean
 *                 default: false
 *               max_workers:
 *                 type: integer
 *                 default: 8
 *     responses:
 *       200:
 *         description: Products updated successfully
 *       500:
 *         description: Internal server error
 */
router.post('/force-update', async (req, res) => {
  try {
    const { search_query, max_products, all_pages, max_workers } = req.body;
    
    if (!search_query) {
      return res.status(400).json({
        error: 'search_query is required'
      });
    }

    const params: ProductSearchParams = {
      search_query,
      max_products: max_products || 10,
      all_pages: all_pages || false,
      max_workers: max_workers || 8
    };

    // Force update by calling FastAPI directly
    const products = await productService.getProducts(params);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      message: 'Products force updated successfully'
    });
    
  } catch (error) {
    console.error('Error in force update route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force update products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     description: Fetches a single product from the database by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: Product retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully',
    });
  } catch (error) {
    console.error('Error in product detail route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;