# Testing Sustainable App Frontend

## Overview
End-to-end testing of the React (Vite + TypeScript + Tailwind CSS) frontend against the Express/MongoDB backend.

## Devin Secrets Needed
None required — the app uses local MongoDB with no external auth.

## Environment Setup

### 1. Install & Start MongoDB
```bash
# MongoDB may not be pre-installed
sudo apt-get install -y mongodb-org
sudo mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
```

### 2. Create Backend .env
```bash
cp backend/.env.example backend/.env
# Defaults work for local dev (BLOCKCHAIN_MODE=mock, local MongoDB URI)
```

### 3. Install Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 4. Seed Database
```bash
# From repo root
npm run seed
```
Seeds 15 products, 10 tips, a demo user (demo@ecolife.com / demo123 with admin role), 4 supply chain actors, and 1 sample movement for the first product.

### 5. Start Servers
```bash
# Backend (port 5000) — run in background shell
npm run start:backend

# Frontend (port 3000) — run in separate background shell
cd frontend && npm run dev
```

## Golden Path Test Flow

1. **Route protection**: Navigate to `/dashboard` while unauthenticated → should redirect to `/login`
2. **Signup**: Register a new user → should redirect to `/dashboard` with "Welcome back, {username}"
3. **Logout**: Click Logout → should redirect to `/login`, navbar shows Login/Sign Up
4. **Login**: Login with demo@ecolife.com / demo123 → should show dashboard with "Welcome back, demo"
5. **Products tab**: Should display 15 product cards in grid with eco scores, prices, categories, environmental metrics
6. **Supply Chain tab**: Default shows 5-stage timeline (Raw Material → Manufacturing → Distribution → Retail → Consumer). Select "Bamboo Toothbrush Set" → shows real data with GreenSource Materials (supplier) → EcoWeave Manufacturing (manufacturer), verified badge, qty, date, blockchain tx hash
7. **Add Purchase tab**: Select a product from dropdown, click "Record Purchase" → green success message
8. **Duplicate signup error**: Try signing up with an already-used email → red error message

## API Endpoints Used by Frontend
- `POST /api/auth/signup` (NOT /register — backend uses /signup)
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/supply-chain/:productId`
- `POST /api/products/purchase`

## Tips
- The frontend uses `VITE_API_URL=http://localhost:5000/api` from `frontend/.env`
- JWT tokens are stored in localStorage under key `token`, user data under `user`
- The backend 401 interceptor clears localStorage and redirects to `/login`
- Supply chain data only exists for the first seeded product (Bamboo Toothbrush Set) — other products will show no movements
- Products are sorted by eco score (highest first) in the dashboard
- The backend uses BLOCKCHAIN_MODE=mock for local dev, so blockchain tx hashes show as "mock..." prefix
