# Vercel Deployment & Monorepo Best Practices

This skill provides the best practices for deploying the EchoNet full-stack application on Vercel, focusing on monorepo structure and cross-origin authentication.

## 🍱 Monorepo Structure

The project is structured with a `backend` (Express) and `frontend` (Next.js).

### Configuration (Root vercel.json)
To coordinate the two projects, a root `vercel.json` should be used to delegate traffic:
- **API Traffic**: Routes starting with `/api` should be rewriten to the `backend/` functions.
- **Frontend Traffic**: Default routes should be handled by the `frontend/` (Next.js) package.

## 🍱 Backend Deployment (Express)

Vercel treats every file in the `api/` directory (or specified in `builds`) as a **Serverless Function**.

### Key Rules:
1.  **Entry Point**: The main handler should be `backend/src/index.ts` (exporting a default `app`).
2.  **Output**: The build output should be a single bundled `.js` file (e.g., `api/index.js`).
3.  **Environment Variables**:
    - `APP_URL`: The production frontend URL.
    - `DATABASE_URL`: Your Prisma database connection string.
    - `JWT_SECRET`: Used for BetterAuth.

## 🍱 Frontend Deployment (Next.js)

### Authentication Cookie Sharing:
- Always use **Rewrites** in `next.config.ts` to proxy `/api/auth` requests. This ensures the browser sees the same origin for both the UI and Auth endpoints, allowing HTTP-only cookies to work seamlessly.

## 🍱 Verification Checklist
- [ ] Build output exists in `backend/api/`.
- [ ] `vercel.json` identifies the correct build target.
- [ ] Environment variables are configured in the Vercel Dashboard.
