import express from 'express';
import { ProductService } from '../services/productService';

const router = express.Router();
const productService = new ProductService();

/**
 * @swagger
 * /products/{sku}:
 *   get:
 *     summary: Get a product by SKU
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU of the product
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/products/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await productService.getProductBySku(sku);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;