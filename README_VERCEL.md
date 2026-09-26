# MANGYSTAU GO — Vercel deployment

## 1. GitHub
Upload the project root to GitHub. Do not upload `.env` files or `node_modules`.

## 2. Vercel
Import the GitHub repository in Vercel. The project already contains the Vercel Express entry point and build configuration.

## 3. PostgreSQL
Connect a hosted PostgreSQL database (for example Neon) and create the same `mangystau_go` schema/tables used by the project.

## 4. Environment Variables
Add these in Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — a strong random secret

The frontend uses the same Vercel domain for `/api`, so `VITE_API_URL` can stay empty in production.

## 5. Redeploy
After adding environment variables, redeploy the project.

## Local development

```text
npm install
npm run server
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:5000`.
