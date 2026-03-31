# EchoNet - Enterprise Social and Marketplace Solution

EchoNet is a modern, high-performance full-stack social networking and community platform designed for real-time engagement, professional content sharing, and integrated e-commerce. Built using a modular micro-service inspired architecture, EchoNet leverages Next.js, Express, Socket.IO, Prisma, and Better Auth to deliver a secure, scalable, and premium user experience.

## Deployment and Professional Linkage

| Resource | URL Endpoint |
| :--- | :--- |
| Frontend Production Build | https://echo-net-bd.vercel.app |
| Backend API Production | https://echonet-backend-mwxk.onrender.com |
| Lead Developer Portfolio | https://xhakil.vercel.app/ |

---

## Test Infrastructure and Credentials

To facilitate comprehensive cross-role testing, the following accounts are pre-seeded within the production environment. These accounts provide relative access to Administrative, Moderation, and Standard User interfaces.

Shared Password for Testing: shakil664

| Identity Email | Authorization Role | Functional Access |
| :--- | :--- | :--- |
| admin@echonet.app | Platform Administrator | Global System Oversight, User Management, Content Moderation. |
| mod@echonet.app | Content Moderator | Community Guidelines Enforcement, Post and Product Moderation. |
| alex@example.com | Standard User | Social Engagement, Personal Feed, Marketplace Interactions. |

---

## Technology Architecture

### Frontend Ecosystem
| Technology Component | Implementation Context |
| :--- | :--- |
| Next.js 16.2.1 | Core application framework utilizing App Router and Optimized Image Delivery. |
| React 19 | Primary UI library leveraging concurrent rendering features. |
| TypeScript | Strict typing across the entire UI and Service layer. |
| Tailwind CSS 4 | Modern utility-first CSS for high-fidelity responsive design. |
| TanStack Query | Asynchronous state management and optimistic UI updates. |
| Framer Motion | Declarative animation engine for premium micro-interactions. |
| Better-Auth Client | Secure cookie-based session management and OAuth handling. |
| Socket.io-client | Bi-directional real-time communication for messaging and events. |
| Radix UI / Base UI | Headless accessible components for design system consistency. |
| Zod | Runtime schema validation for forms and API responses. |

### Backend Infrastructure
| Technology Component | Implementation Context |
| :--- | :--- |
| Node.js Runtime | Scalable JavaScript runtime for server-side operations. |
| Express.js 5.2.1 | Minimalist web framework for modular API development. |
| PostgreSQL | Robust relational database system with Prisma ORM mapping. |
| Prisma ORM | Type-safe database access and automated migrations. |
| Redis | In-memory distributed caching and Socket.IO horizontal scaling. |
| Socket.io Server | WebSocket engine for real-time notifications and private messaging. |
| Stripe | Enterprise-grade payment processing and automated billing. |
| Cloudinary | Global Media Delivery Network for high-resolution static assets. |
| Winston | Professional logging system with varying transport levels. |
| Helmet / CORS | Security middleware for protocol protection and cross-origin safety. |

---

## Strategic Feature Implementation

### 1. Advanced Authentication and Authorization
- Multi-tier RBAC (Role Based Access Control) integrated into both API and Route guards.
- Secure, cross-domain cookie-based authentication.
- Automated email verification and multi-factor recovery pathways.

### 2. Real-Time Engagement Engine
- Distributed messaging system with persistent storage and real-time delivery.
- Context-aware notification system (Likes, Follows, Mentions, Messages).
- Global state synchronization via WebSockets for live feed updates.

### 3. Integrated E-Commerce Ecosystem
- Multi-tenancy store management for verified agents and merchants.
- PCI-compliant payment processing utilizing Stripe's latest API.
- Dynamic inventory management and order lifecycle tracking.

### 4. Social Graph and Content Management
- Infinite scrolling discovery feed with algorithmic content prioritization.
- Ephemeral content system (Stories) with view analytics and auto-purging.
- Complex relationship mapping including bidirectional follow and friendship logic.

---

## Modular File Structure

EchoNet adopts a domain-driven design to ensure maintainability and clean separation of concerns.

- /backend/src/app/module/: Contains independent modules for Auth, Posts, Comments, Marketplace, and more. Each module encapsulates its own routes, controllers, and services.
- /backend/prisma/: Centralized database schema defining types for the entire full-stack application.
- /frontend/src/app/: Next.js file-system routing following the App Router pattern.
- /frontend/src/services/: Isolated service layer for handling external API and WebSocket communications.

---

## Detailed Environment Configuration

### Backend Variable Schema
| Variable Key | Functional Description | Required |
| :--- | :--- | :--- |
| DATABASE_URL | Neon/Postgres connection string. | Yes |
| BETTER_AUTH_SECRET | Secret for cryptographic session signing. | Yes |
| PORT | Port number for the Express server (default: 8000). | Yes |
| REDIS_URL | Connection string for Redis instance. | Yes |
| STRIPE_SECRET_KEY | Private key for Stripe transaction handling. | Yes |

### Frontend Variable Schema
| Variable Key | Functional Description | Required |
| :--- | :--- | :--- |
| NEXT_PUBLIC_BACKEND_URL | Base endpoint for API communication. | Yes |
| NEXT_PUBLIC_SOCKET_URL | Dedicated WebSocket server endpoint. | Yes |

---

## Operational Installation

1. Prepare Database: Ensure a PostgreSQL instance is available and the DATABASE_URL is correctly configured.
2. Dependencies: Execute pnpm install in both the root directories of frontend and backend.
3. Database Initialization: Run pnpm run prisma:generate followed by pnpm run prisma:migrate.
4. Data Seeding: Execute pnpm run seed in the backend directory to populate the environment.
5. Launch: Start both applications simultaneously using pnpm dev in their respective directories.

---

## Maintenance and License

This project is licensed under the MIT License. 

Core Architecture and Development by Shakil Ahmed Billal.
For professional inquiries or technical collaboration, please refer to the portfolio linked in the deployment section.
