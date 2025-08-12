export interface Product {
  id?: number;
  name: string;
  price: string;
  sku: string;
  images: string[];
  specs: Record<string, any>;
  availability: string;
  estimate: string;
  store_info: string;
  warranty: string;
  src: string; // URL sumber scraping
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductSearchParams {
  search_query: string;
  max_products?: number;
  all_pages?: boolean;
  max_workers?: number;
} 