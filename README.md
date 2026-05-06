# Product Management App

A production-grade REST API for managing products, built with **Node.js**, **TypeScript**, and **Express** — integrating **Redis caching**, **Winston logging**, **Elasticsearch full-text search**, and **RabbitMQ event-driven stock alerts**.

---

## 🚀 Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Runtime    | Node.js (LTS via nvm)      |
| Language   | TypeScript                 |
| Framework  | Express.js                 |
| ORM        | Sequelize v6               |
| Database   | PostgreSQL                 |
| Caching    | Redis (ioredis)            |
| Logging    | Winston                    |
| Search     | Elasticsearch 8.x          |
| Messaging  | RabbitMQ (amqplib)         |
| Containers | Docker + docker-compose    |
| API Docs   | Swagger UI (swagger-jsdoc) |
| Linting    | ESLint v10 (flat config)   |
| Formatting | Prettier                   |
| Git Hooks  | Husky + lint-staged        |

---

## 📁 Project Structure

```
product-management-app/
├── src/
│   ├── config/
│   │   ├── database.ts           # Sequelize + PostgreSQL connection
│   │   ├── redis.ts              # ioredis client
│   │   ├── elasticsearch.ts      # Elasticsearch client + connect
│   │   ├── esIndex.ts            # Products index + field mappings
│   │   ├── rabbitmq.ts           # AMQP connection + channel
│   │   ├── swagger.ts            # Swagger/OpenAPI config
│   │   └── sequelize-config.js   # Sequelize CLI config
│   ├── controllers/
│   │   └── product.controller.ts # CRUD + search request handlers
│   ├── jobs/
│   │   ├── stockProducer.ts      # RabbitMQ low-stock publisher
│   │   └── stockConsumer.ts      # RabbitMQ alert consumer
│   ├── middlewares/
│   │   ├── errorHandler.ts       # Global Express error handler
│   │   └── requestLogger.ts      # Winston HTTP request logger
│   ├── migrations/
│   │   └── xxx-create-products-table.js
│   ├── models/
│   │   └── product.model.ts      # Sequelize Product model
│   ├── routes/
│   │   └── product.routes.ts     # Routes + Swagger JSDoc comments
│   ├── services/
│   │   ├── product.service.ts    # Business logic + Redis cache-aside
│   │   └── search.service.ts     # Elasticsearch index + search
│   ├── types/
│   │   └── product.types.ts      # Shared TypeScript interfaces/DTOs
│   ├── utils/
│   │   ├── logger.ts             # Winston logger (console + file)
│   │   ├── cache.ts              # Cache-aside helper (get/set/del)
│   │   └── cacheKeys.ts          # Centralised Redis key definitions
│   ├── app.ts                    # Express app + health check
│   └── index.ts                  # Server entry point + all connections
├── logs/
│   ├── app.log                   # All logs in JSON format
│   └── error.log                 # Errors only
├── docker-compose.yml            # Redis + RabbitMQ + Elasticsearch
├── .env                          # Environment variables (not committed)
├── .gitignore
├── .nvmrc                        # Node version lock
├── .prettierrc                   # Prettier config
├── .sequelizerc                  # Sequelize CLI path config
├── eslint.config.js              # ESLint v10 flat config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## ⚙️ Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) — Node Version Manager
- Node.js LTS (via nvm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — for Redis, RabbitMQ, Elasticsearch
- PostgreSQL 14+ — installed locally

---

## 🐳 Docker Services

Redis, RabbitMQ, and Elasticsearch all run via Docker.

### Start all services

```bash
npm run docker:up
# or: docker-compose up -d
```

### Stop all services

```bash
npm run docker:down
```

### View logs

```bash
npm run docker:logs
```

### Service ports

| Service       | Port  | URL / Notes                          |
| ------------- | ----- | ------------------------------------ |
| Redis         | 6379  | `redis-cli ping` → PONG              |
| RabbitMQ AMQP | 5672  | Used internally by the app           |
| RabbitMQ UI   | 15672 | http://localhost:15672 (admin/admin) |
| Elasticsearch | 9200  | http://localhost:9200                |

---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd product-management-app
```

### 2. Use correct Node version

```bash
nvm use
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start Docker services

```bash
npm run docker:up
```

### 5. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_management
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672
RABBITMQ_QUEUE=stock_alerts

# Elasticsearch
ES_HOST=http://localhost:9200
ES_INDEX=products

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

### 6. Create the PostgreSQL database

```bash
psql -U postgres
```

```sql
CREATE DATABASE product_management;
\q
```

### 7. Run database migrations

```bash
npx sequelize-cli db:migrate
```

---

## ▶️ Running the App

### Development (auto-restart on save)

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

Expected startup output:

```
Database connected
Models synced
Redis connected
Elasticsearch connected
Elasticsearch index "products" created
Elasticsearch synced
RabbitMQ connected        { queue: 'stock_alerts' }
Stock alert consumer listening on queue: stock_alerts
Server running on http://localhost:5000
API Docs at http://localhost:5000/api-docs
Server Health at http://localhost:5000/health

```

---

## 📜 Available Scripts

| Script      | Command               | Description                               |
| ----------- | --------------------- | ----------------------------------------- |
| Development | `npm run dev`         | Run with ts-node-dev (auto-restart)       |
| Build       | `npm run build`       | Compile TypeScript → `dist/`              |
| Start       | `npm start`           | Run compiled production build             |
| Lint        | `npm run lint`        | Run ESLint on all `.ts` files             |
| Format      | `npm run format`      | Auto-format all `.ts` files with Prettier |
| Docker Up   | `npm run docker:up`   | Start Redis, RabbitMQ, Elasticsearch      |
| Docker Down | `npm run docker:down` | Stop all Docker services                  |
| Docker Logs | `npm run docker:logs` | Tail logs from all Docker services        |

---

## 🌐 Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint                       | Description                 | Cache       |
| ------ | ------------------------------ | --------------------------- | ----------- |
| GET    | `/health`                      | Health check (all services) | No          |
| GET    | `/api/products`                | Get all products            | ✅ Redis    |
| GET    | `/api/products?category=X`     | Filter by category          | ✅ Redis    |
| GET    | `/api/products/:id`            | Get product by ID           | ✅ Redis    |
| GET    | `/api/products/search?query=X` | Full-text ES search         | No          |
| POST   | `/api/products`                | Create a product            | Invalidates |
| PUT    | `/api/products/:id`            | Update a product            | Invalidates |
| DELETE | `/api/products/:id`            | Delete a product            | Invalidates |
| GET    | `/api-docs`                    | Swagger UI                  | No          |

---

## 🔎 Search API

The search endpoint uses **Elasticsearch** with:

- Full-text search on `name`, `description`, `category`
- `name` boosted 3x (`name^3`)
- Fuzzy matching for typos (`fuzziness: AUTO`)
- Optional filters: `category`, `minPrice`, `maxPrice`
- Highlighted match snippets in response

### Examples

```bash
# Basic search
curl "http://localhost:5000/api/products/search?query=macbook"

# Search with category filter
curl "http://localhost:5000/api/products/search?query=laptop&category=Electronics"

# Search with price range
curl "http://localhost:5000/api/products/search?query=apple&minPrice=1000&maxPrice=2000"

# Fuzzy search (handles typos)
curl "http://localhost:5000/api/products/search?query=mackbook"
```

---

## ⚡ Redis Caching (Cache-Aside Pattern)

```
GET /api/products
       │
       ▼
  Check Redis
       │
  ┌────┴────┐
  │         │
HIT       MISS
  │         │
Return    Query PostgreSQL
cached  → Store in Redis (TTL: 3600s)
data    → Return data
```

### Cache Keys

| Key                        | Description          |
| -------------------------- | -------------------- |
| `products:all`             | All products list    |
| `products:{id}`            | Single product by ID |
| `products:category:{name}` | Products by category |

> All cache keys are **invalidated** on every create, update, or delete operation.

---

## 📝 Winston Logging

All operations are logged with structured JSON.

### Log Files

| File             | Contains                       |
| ---------------- | ------------------------------ |
| `logs/app.log`   | All logs (info + warn + error) |
| `logs/error.log` | Errors only                    |

Both files auto-rotate at **5MB**, keeping last **5 files**.

### Log Levels

| Level   | When used                                     |
| ------- | --------------------------------------------- |
| `debug` | Cache hits/misses, SQL queries, ES operations |
| `info`  | Server start, product CRUD, ES sync           |
| `warn`  | Low stock alerts, unexpected but non-breaking |
| `error` | DB failures, service down, unhandled errors   |

---

## 📨 RabbitMQ — Low Stock Alerts

When a product's stock reaches **≤ 10 units** (on create or update), an event is published to the `stock_alerts` queue.

### Flow

```
ProductService (create/update)
        │
        │ stock ≤ 10
        ▼
  stockProducer.ts         ← publishes to RabbitMQ
        │
        ▼
  Queue: stock_alerts
        │
        ▼
  stockConsumer.ts         ← consumes + processes
        │
        ▼
  logger.warn (dev)
  email/SMS/Slack (prod)   ← plug in Nodemailer/Twilio here
```

### Test Low Stock Alert

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Limited Watch","description":"Only a few left","price":499.99,"stock":5,"category":"Accessories"}'
```

Expected terminal output:

```
warn: Stock alert published    { productId: 1, stock: 5 }
warn: LOW STOCK ALERT received { productId: 1, currentStock: 5, threshold: 10 }
```

Monitor the queue at: **http://localhost:15672** (admin/admin)

---

## 🗄️ Database Migrations

| Command                                            | Description                |
| -------------------------------------------------- | -------------------------- |
| `npx sequelize-cli db:migrate`                     | Run all pending migrations |
| `npx sequelize-cli db:migrate:undo`                | Rollback last migration    |
| `npx sequelize-cli db:migrate:undo:all`            | Rollback all migrations    |
| `npx sequelize-cli migration:create --name <name>` | Create new migration       |

> Never modify the DB schema manually. Always create a new migration.

---

## 🏥 Health Check

```bash
curl http://localhost:5000/health
```

```json
{
  "status": "OK",
  "timestamp": "2026-05-05T10:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "elasticsearch": "connected",
    "rabbitmq": "connected"
  }
}
```

Returns `503` if any service is down.

---

## 🔒 Git Hooks (Husky)

On every `git commit`, lint-staged runs automatically:

- ESLint auto-fixes staged `.ts` files
- Prettier formats staged `.ts` files

---

## 🔮 Suggested Future Improvements

- [ ] **Email/SMS notifications** — plug Nodemailer or Twilio into `stockConsumer.ts`
- [ ] **JWT Authentication** — protect write endpoints with `passport-jwt`
- [ ] **Pagination** — add `limit`/`offset` to `GET /api/products`
- [ ] **Input validation** — use `zod` for request body schema validation
- [ ] **Dead Letter Queue** — route failed RabbitMQ messages to a DLQ for retry
- [ ] **ES aggregations** — add `/api/products/stats` endpoint (avg price by category)
- [ ] **Tests** — unit + integration tests with Jest + supertest
- [ ] **Docker for app** — add app container to `docker-compose.yml`
- [ ] **Rate limiting** — `express-rate-limit` to protect public endpoints
- [ ] **Microservice split** — extract stock consumer into its own Node.js service

---

## 📊 Architecture Overview

```
Client Request
      │
      ▼
Express (app.ts)
      │
      ├── requestLogger   (Winston — logs every HTTP request)
      ├── /api-docs       (Swagger UI)
      ├── /health         (checks all 4 services live)
      └── /api/products
              │
              ▼
      ProductController
              │
              ▼
      ProductService
       ├── Redis          cache-aside (get → fallback → set)
       ├── PostgreSQL     source of truth (Sequelize ORM)
       ├── Elasticsearch  index on every write, search on demand
       └── RabbitMQ       publish low-stock events → consumer
```

---

## 👤 Author

Built as part of the **Backend Development Learning Guide — Phase 2**
Stack: Node.js · TypeScript · Express · PostgreSQL · Redis · Elasticsearch · RabbitMQ · Winston · Docker
