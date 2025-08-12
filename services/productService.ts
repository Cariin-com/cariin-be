import pool from '../config/database';
import axios from 'axios';
import { Product, ProductSearchParams } from '../models/Product';

export class ProductService {
  // Check if data needs update (simple implementation - can be enhanced)
  private async shouldUpdateData(): Promise<boolean> {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count, MAX(updated_at) as last_update FROM products'
      );
      
      const count = parseInt(result.rows[0].count);
      const lastUpdate = result.rows[0].last_update;
      
      // If no data exists, we need to fetch
      if (count === 0) return true;
      
      // If last update was more than 1 hour ago, we need to update
      if (lastUpdate) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return new Date(lastUpdate) < oneHourAgo;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking data update status:', error);
      return true; // Default to fetching new data on error
    }
  }

  // Get products from database
  private async getProductsFromDB(): Promise<Product[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM products ORDER BY updated_at DESC'
      );
      const products = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        sku: row.sku,
        images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
        specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs,
        availability: row.availability,
        estimate: row.estimate || '',
        store_info: row.store_info || '',
        warranty: row.warranty || '',
        src: row.src || '',
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
      
      console.log('Products from DB:', products.map(p => ({ name: p.name, src: p.src })));
      return products;
    } catch (error) {
      console.error('Error fetching products from database:', error);
      throw new Error('Failed to fetch products from database');
    }
  }

  // Fetch products from FastAPI
  private async fetchProductsFromFastAPI(params: ProductSearchParams): Promise<Product[]> {
    try {
      const fastApiUrl = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${fastApiUrl}/scrape`, {
        search_query: params.search_query,
        max_products: params.max_products || 10,
        all_pages: params.all_pages || false,
        max_workers: params.max_workers || 8
      });

      console.log('Products from FastAPI:', response.data.map((p: any) => ({ name: p.name, src: p.src })));
      return response.data;
    } catch (error) {
      console.error('Error fetching products from FastAPI:', error);
      throw new Error('Failed to fetch products from FastAPI');
    }
  }

  // Save products to database
  private async saveProductsToDB(products: Product[]): Promise<void> {
    try {
      // Clear existing data
      await pool.query('DELETE FROM products');
      
      // Insert new products
      for (const product of products) {
        await pool.query(
          `INSERT INTO products (
            name, price, sku, images, specs, availability, 
            estimate, store_info, warranty, src, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            product.name,
            product.price,
            product.sku,
            JSON.stringify(product.images),
            JSON.stringify(product.specs),
            product.availability,
            product.estimate,
            product.store_info,
            product.warranty,
            product.src || '',
            new Date(),
            new Date()
          ]
        );
      }
      
      console.log(`Saved ${products.length} products to database`);
    } catch (error) {
      console.error('Error saving products to database:', error);
      // Don't throw error, just log it
      console.log('Continuing without saving to database...');
    }
  }

  // Main method to get products with caching logic
  async getProducts(params: ProductSearchParams): Promise<Product[]> {
    try {
      // Check if we need to update data
      const needsUpdate = await this.shouldUpdateData();
      
      if (needsUpdate) {
        console.log('Data needs update, fetching from FastAPI...');
        
        // Fetch from FastAPI
        const products = await this.fetchProductsFromFastAPI(params);
        
        // Save to database (don't fail if this doesn't work)
        try {
          await this.saveProductsToDB(products);
        } catch (dbError) {
          console.error('Failed to save to database, but continuing...', dbError);
        }
        
        return products;
      } else {
        console.log('Using cached data from database...');
        
        // Get from database
        return await this.getProductsFromDB();
      }
    } catch (error) {
      console.error('Error in getProducts:', error);
      
      // Fallback to database if FastAPI fails
      try {
        console.log('Falling back to database data...');
        return await this.getProductsFromDB();
      } catch (dbError) {
        console.error('Database fallback also failed:', dbError);
        // Return empty array instead of throwing error
        return [];
      }
    }
  }

  // Get a single product by ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      const product: Product = {
        id: row.id,
        name: row.name,
        price: row.price,
        sku: row.sku,
        images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
        specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs,
        availability: row.availability,
        estimate: row.estimate || '',
        store_info: row.store_info || '',
        warranty: row.warranty || '',
        src: row.src || '',
        created_at: row.created_at,
        updated_at: row.updated_at
      };
      return product;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw new Error('Failed to fetch product from database');
    }
  }

  // Get a single product by SKU
  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      const result = await pool.query('SELECT * FROM products WHERE sku = $1', [sku]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      const product: Product = {
        id: row.id,
        name: row.name,
        price: row.price,
        sku: row.sku,
        images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
        specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs,
        availability: row.availability,
        estimate: row.estimate || '',
        store_info: row.store_info || '',
        warranty: row.warranty || '',
        src: row.src || '',
        created_at: row.created_at,
        updated_at: row.updated_at
      };
      return product;
    } catch (error) {
      console.error(`Error fetching product with sku ${sku}:`, error);
      throw new Error('Failed to fetch product from database');
    }
  }

  // Initialize database table
  async initializeTable(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(500) NOT NULL,
          price VARCHAR(50) NOT NULL,
          sku VARCHAR(100) UNIQUE NOT NULL,
          images JSONB NOT NULL,
          specs JSONB NOT NULL,
          availability VARCHAR(100) NOT NULL,
          estimate TEXT DEFAULT '',
          store_info TEXT DEFAULT '',
          warranty TEXT DEFAULT '',
          src TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Products table initialized successfully');
    } catch (error) {
      console.error('Error initializing products table:', error);
      console.log('Continuing without database initialization...');
    }
  }
}