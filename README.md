# ApexGateway 🚀

[![Node.js](https://img.shields.io/badge/Node.js-v18+-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-v4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-v7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-v5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Monetization-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

An enterprise-grade, high-performance **API Gateway & Monetization Marketplace Platform**. ApexGateway enables API providers to list, monetise, and manage their APIs with rate-limiting and access controls, while providing consumers with an intuitive portal to discover APIs, manage subscriptions, generate API keys, and monitor usage analytics in real-time.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Core Features](#-core-features)
- [Services Overview](#-services-overview)
  - [1. Gateway Proxy Service (Port 4000)](#1-gateway-proxy-service-port-4000)
  - [2. Marketplace API Service (Port 3000)](#2-marketplace-api-service-port-3000)
  - [3. Client Web Dashboard (Port 5173)](#3-client-web-dashboard-port-5173)
- [Environment Variables](#-environment-variables)
- [Quick Start Guide](#-quick-start-guide)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
  - [Option B: Manual Development Setup](#option-b-manual-development-setup)
- [API Reference & Postman Collection](#-api-reference--postman-collection)
- [Testing & Verification](#-testing--verification)

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        UI["React 19 Dashboard<br/>Port 5173"]
        Consumer["API Consumer App"]
    end

    subgraph AuthProvider ["Authentication"]
        Supabase["Supabase Auth Service<br/>JWT Issuer"]
    end

    subgraph BackendServices ["ApexGateway Core Services"]
        MktAPI["Marketplace API<br/>Port 3000<br/>• User & Role Sync<br/>• API & Plan Management<br/>• Subscriptions & Keys<br/>• Stripe Ledger"]
        GatewayProxy["Gateway Proxy<br/>Port 4000<br/>• X-API-Key Auth<br/>• Redis Fast Auth Cache<br/>• Token Bucket Rate Limiting<br/>• Asynchronous Logging"]
    end

    subgraph StorageLayer ["Data & Cache Layer"]
        Postgres[(PostgreSQL 15<br/>Prisma ORM)]
        Redis[(Redis 7 Cache<br/>Rate Limiter & Analytics)]
    end

    subgraph UpstreamLayer ["External Services"]
        StripeAPI["Stripe Payments"]
        TargetAPIs["Upstream APIs<br/>Target Services"]
    end

    UI -->|"Supabase Auth JWT"| MktAPI
    UI -->|"Authenticate"| Supabase
    Consumer -->|"X-API-Key Header<br/>/api/:apiName/*"| GatewayProxy

    MktAPI -->|"Verify JWT"| Supabase
    MktAPI -->|"Read/Write Metadata"| Postgres
    MktAPI -->|"Process Payments & Payouts"| StripeAPI

    GatewayProxy -->|"O(1) Key Lookup & Rate Limits"| Redis
    GatewayProxy -->|"Cache Miss Fallback & Async Analytics"| Postgres
    GatewayProxy -->|"Proxy Rewritten Request"| TargetAPIs
```

---

## 📁 Repository Structure

```text
ApexGateway/
├── client/                           # React 19 Frontend Web Application
│   ├── src/
│   │   ├── components/               # UI layout, charts, forms, tables
│   │   ├── context/                  # AuthContext (Supabase Integration)
│   │   ├── pages/                    # Marketplace, Dashboard, Analytics, Billing
│   │   ├── services/                 # Axios API clients
│   │   └── store/                    # Zustand global state stores
│   ├── .env.example                  # Frontend environment variables template
│   └── package.json
│
├── server/
│   ├── gateway/                      # High-throughput Gateway Proxy microservice (Port 4000)
│   │   ├── src/
│   │   │   ├── config/               # Prisma DB & Redis client initialisation
│   │   │   ├── middleware/           # Auth validator, Token Bucket rate limiter
│   │   │   ├── proxy/                # http-proxy-middleware request rewriter
│   │   │   └── services/             # Analytics logger & Redis cache service
│   │   ├── tests/                    # E2E & Rate limiter test suite
│   │   ├── prisma/                   # Database schema definitions
│   │   └── package.json
│   │
│   ├── marketplace/                  # Marketplace & Administrative microservice (Port 3000)
│   │   ├── src/
│   │   │   ├── controllers/          # Auth, API, Plan, Subscription, Stripe, Analytics
│   │   │   ├── middleware/           # Supabase JWT validator & Role guard
│   │   │   ├── routes/               # Express API route modules
│   │   │   └── services/             # Stripe service & DB access layer
│   │   ├── prisma/                   # Database schema & migrations
│   │   └── package.json
│   │
│   └── README.md                     # Microservices backend documentation
│
├── ApexGateway.postman_collection.json # Ready-to-use Postman collection
├── docker-compose.yml                # Multi-container Orchestration (Postgres, Redis, Gateway, Marketplace)
└── README.md                         # Main repository documentation
```

---

## ⚡ Core Features

- **🚀 Sub-Millisecond API Gateway Proxy**: Validates client request headers via `X-API-Key`, computes SHA-256 hashes, performs fast $O(1)$ lookups in Redis, and rewrites incoming URLs (`/api/:apiName/*`) directly to upstream backend servers.
- **🛡️ Distributed Token-Bucket Rate Limiting**: Enforces rate limits per subscription plan dynamically using Redis atomicity to prevent upstream overload.
- **🔐 Dual Authentication Architecture**:
  - **Marketplace Management**: Protected via `Bearer <Supabase_JWT>` with automated local database user profile and role synchronization (`PROVIDER` vs `CONSUMER`).
  - **Gateway Execution**: Authenticated using high-security `X-API-Key` (`apx_live_...`) tokens.
- **💳 Stripe Monetization & Balance Ledger**: Integrates Stripe payment intents for paid subscription tier checkout, automatically calculating provider earnings and platform fee commission.
- **📊 Real-time Analytics & Logging**: Asynchronously pushes request timestamps, latency, status codes, and path data to Redis queues and PostgreSQL for analytics dashboards.
- **💻 Modern Interactive Dashboard**: Built with React 19, Vite, TailwindCSS v4, Recharts visualization, and Zustand state management.

---

## 🛠️ Services Overview

### 1. Gateway Proxy Service (Port 4000)
- **Primary Function**: Intercepts requests under `/api/:apiName/*`, validates `X-API-Key`, enforces token-bucket limits, logs usage, and proxies traffic to the targeted upstream API server.
- **Security**: Raw API keys are never stored in the database. SHA-256 digests are cached in Redis for fast matching.
- **Key Files**: `server/gateway/src/middleware/auth.js`, `server/gateway/src/middleware/rateLimiter.js`, `server/gateway/src/proxy/httpProxy.js`.

### 2. Marketplace API Service (Port 3000)
- **Primary Function**: Management plane for providers to register APIs and pricing plans, and for consumers to browse APIs, subscribe, generate keys, view metrics, and manage billing.
- **Security**: Validates incoming Supabase Bearer JWT tokens locally via `jose`/`jsonwebtoken` and checks `user_metadata.role`.
- **Key Files**: `server/marketplace/src/controllers/apiController.js`, `server/marketplace/src/controllers/stripeController.js`, `server/marketplace/src/controllers/subscriptionController.js`.

### 3. Client Web Dashboard (Port 5173)
- **Primary Function**: Modern web application interface serving two distinct roles:
  - **Consumer Experience**: Browse API catalog, subscribe to plans, copy API keys, view live usage charts, test endpoints.
  - **Provider Experience**: Publish new APIs, configure pricing tiers, track revenue, withdraw funds via Stripe.

---

## ⚙️ Environment Variables

### `client/.env`
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MARKETPLACE_API_URL=http://localhost:3000
VITE_GATEWAY_API_URL=http://localhost:4000
```

### `server/gateway/.env`
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/apexgateway?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### `server/marketplace/.env`
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/apexgateway?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚀 Quick Start Guide

### Option A: Docker Compose (Recommended)

Run the entire platform (PostgreSQL, Redis, Marketplace API, and Gateway Proxy) with a single command:

```bash
# Clone the repository
git clone https://github.com/your-username/ApexGateway.git
cd ApexGateway

# Start containers in detached mode
docker-compose up --build -d
```

Containers spun up:
- `apex-postgres`: PostgreSQL DB on port `5433`
- `apex-redis`: Redis Cache on port `6379`
- `apex-marketplace`: Marketplace API on port `3000`
- `apex-gateway-proxy`: Gateway Proxy on port `4000`

---

### Option B: Manual Development Setup

#### Prerequisites
- Node.js (v18+) & npm
- PostgreSQL (v15+)
- Redis (v7+)

#### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/ApexGateway.git
cd ApexGateway
```

#### Step 2: Set up Database & Marketplace API
```bash
cd server/marketplace
npm install
cp .example.env .env
# Edit .env with your PostgreSQL, Redis, Supabase, and Stripe keys

# Run Prisma Database Migrations
npx prisma migrate dev --name init
npx prisma generate

# Start Marketplace API in dev mode
npm run dev
```

#### Step 3: Set up Gateway Proxy
```bash
cd ../gateway
npm install
cp .example.env .env
# Edit .env with matching DATABASE_URL and REDIS parameters

# Generate Prisma Client
npx prisma generate

# Start Gateway Proxy in dev mode
npm run dev
```

#### Step 4: Set up Client Dashboard
```bash
cd ../../client
npm install
cp .example.env .env
# Edit .env with Supabase and API URLs

# Start Vite React Dev Server
npm run dev
```

The frontend dashboard will be live at `http://localhost:5173`.

---

## 📡 API Reference & Postman Collection

The repository includes a comprehensive Postman collection: [`ApexGateway.postman_collection.json`](./ApexGateway.postman_collection.json).

### Quick Import Steps:
1. Open Postman.
2. Click **Import** and select `ApexGateway.postman_collection.json`.
3. Configure your Environment Variables: `baseUrl` (`http://localhost:3000`), `gatewayUrl` (`http://localhost:4000`), `supabaseJwt`, and `apiKey`.

### Core Endpoint Summary

| Service | Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Marketplace** | `POST` | `/auth/register` | Register & sync user profile | `Bearer <Supabase_JWT>` |
| **Marketplace** | `GET` | `/auth/me` | Fetch logged-in user profile | `Bearer <Supabase_JWT>` |
| **Marketplace** | `GET` | `/apis` | List all published APIs | Public / Optional Auth |
| **Marketplace** | `POST` | `/apis` | Publish new API definition | `Bearer <Supabase_JWT>` (`PROVIDER`) |
| **Marketplace** | `POST` | `/subscriptions` | Subscribe to plan & issue API key | `Bearer <Supabase_JWT>` (`CONSUMER`) |
| **Marketplace** | `GET` | `/analytics/consumer` | Fetch consumer analytics dashboard | `Bearer <Supabase_JWT>` |
| **Marketplace** | `POST` | `/stripe/create-checkout-session` | Start Stripe checkout session | `Bearer <Supabase_JWT>` |
| **Gateway** | `ALL` | `/api/:apiName/*` | Proxy request to upstream service | `X-API-Key: apx_live_...` |

*(Detailed request/response body documentation is available in [`server/README.md`](./server/README.md).)*

---

## 🧪 Testing & Verification

The Gateway Proxy microservice comes with automated unit and integration end-to-end tests:

```bash
cd server/gateway

# Run full test suite (E2E + Rate Limiter)
npm test

# Run E2E proxy tests only
npm run test:e2e

# Run Token Bucket rate limiter tests only
npm run test:ratelimit
```

---

