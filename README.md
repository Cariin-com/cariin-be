# Cariin Backend API

Backend API untuk aplikasi Cariin dengan fitur caching dan integrasi FastAPI.

## Fitur

- **Caching Logic**: API akan mengecek database terlebih dahulu sebelum mengambil data dari FastAPI
- **PostgreSQL Integration**: Menggunakan PostgreSQL sebagai database
- **FastAPI Integration**: Terintegrasi dengan FastAPI untuk scraping data
- **Swagger Documentation**: Dokumentasi API otomatis
- **Health Check**: Endpoint untuk monitoring

## Flow API

1. **Request ke `/api/product`** dengan parameter `search_query`
2. **Cek Database**: Apakah ada data yang sudah update (dalam 1 jam terakhir)?
   - **Jika ADA**: Ambil data dari database
   - **Jika TIDAK ADA**: Ambil dari FastAPI, simpan ke database, lalu kirim response
3. **Response**: Data produk dalam format JSON

## Setup

### Prerequisites

- Node.js (v16 atau lebih baru)
- PostgreSQL
- Python (untuk FastAPI)

### Installation

1. **Clone repository**

```bash
git clone <repository-url>
cd cariin-be
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**
   Buat file `.env` dengan konfigurasi berikut:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cariin_db
DB_USER=postgres
DB_PASSWORD=password

# FastAPI Configuration
FASTAPI_BASE_URL=https://bhineka-service.vercel.app

# Server Configuration
PORT=3000
NODE_ENV=development
```

4. **Setup PostgreSQL**

```sql
CREATE DATABASE cariin_db;
```

5. **Start FastAPI server**

```bash
cd ../bhineka
python -m uvicorn app:app --reload --port 8000
```

6. **Start Express server**

```bash
npm run dev
```

## API Endpoints

### GET `/api/product`

Mengambil data produk dengan caching logic.

**Query Parameters:**

- `search_query` (required): Query pencarian produk
- `max_products` (optional): Jumlah maksimal produk (default: 10)
- `all_pages` (optional): Scrape semua halaman (default: false)
- `max_workers` (optional): Jumlah worker untuk scraping (default: 8)

**Example:**

```bash
GET /api/product?search_query=laptop&max_products=5
```

### POST `/api/product/force-update`

Memaksa update data dari FastAPI.

**Request Body:**

```json
{
  "search_query": "laptop",
  "max_products": 10,
  "all_pages": false,
  "max_workers": 8
}
```

### GET `/health`

Health check endpoint.

### GET `/api-docs`

Dokumentasi API Swagger.

## Database Schema

```sql
CREATE TABLE products (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "HP Laptop 14-ep0001TU",
      "price": "9049000.0",
      "sku": "3340008858",
      "images": ["https://example.com/image.jpg"],
      "specs": {
        "Platform": "Notebook",
        "Tipe Prosesor": "Intel Core i5"
      },
      "availability": "Available",
      "estimate": "Siap dikirim 2-5 hari",
      "store_info": "Dijual dan dikirim oleh Bhinneka",
      "warranty": "2 Years Local Official Distributor Warranty",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Products retrieved successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to retrieve products",
  "message": "Error details"
}
```

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build untuk production
- `npm start`: Start production server

### Logs

Server akan menampilkan log berikut:

- `Data needs update, fetching from FastAPI...`: Ketika mengambil data dari FastAPI
- `Using cached data from database...`: Ketika menggunakan data dari database
- `Falling back to database data...`: Ketika FastAPI gagal dan menggunakan database

## Troubleshooting

1. **Database connection error**: Pastikan PostgreSQL berjalan dan konfigurasi database benar
2. **FastAPI connection error**: Pastikan FastAPI server berjalan di port 8000
3. **Module not found**: Jalankan `npm install` untuk menginstall dependencies

## License

MIT
