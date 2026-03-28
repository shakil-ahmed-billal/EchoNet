# EchoNet 🌐

**EchoNet** is a modern, full-stack social networking and community platform designed for real-time engagement, seamless content sharing, and integrated e-commerce. Built with a robust ecosystem including **Next.js**, **Express**, **Socket.IO**, **Prisma**, and **Better Auth**, EchoNet offers an unparalleled user experience for connecting people and digital storefronts.

---

## 🚀 Features

EchoNet is packed with comprehensive features that make it a standout platform:

### 🔐 Secure Authentication (Powered by Better Auth)
- **Email & Password Authentication**: Secure registration and login flow.
- **Social OAuth Integration**: Instant sign-in via Google and Facebook.
- **Session Management**: Secure, HTTP-only, cross-domain cookie handling for production and local development.
- **Password Recovery**: OTP-based email verification and password reset functionality.

### 💬 Real-Time Social Interactions
- **Live Feed System**: Dynamic, infinite-scrolling discoverable post feeds (`getFeed`).
- **WebSockets (Socket.IO)**: Real-time private messaging, instant notifications, and live presence updates directly in your private room.
- **Rich Engagement**: Like, react, comment, reply, and save posts to your personal collection.
- **Ephemeral Content**: Engage with 24-hour "Stories" and track views seamlessly.
- **Follower Graph**: Build connections with a fully realized follow/unfollow and follower-tracking system.

### 🛒 Integrated Marketplace
- **Digital Storefronts**: Create bespoke stores grouped by hierarchical categories.
- **Product Listings**: Showcase products with detailed descriptions and dynamic inventory.
- **Secure Stripe Checkout**: Seamless payment gateway integration via Stripe, complete with webhook processing for order fulfillment.

### 🖼️ Media & Infrastructure
- **Cloudinary Integration**: High-performance image and avatar hosting.
- **Neon Serverless Postgres**: Highly available, scalable relational database powered by Prisma ORM.

---

## 📂 File Structure

EchoNet adopts a monorepo-style structure, separating the client interface from the API and WebSocket server.

```text
EchoNet/
├── frontend/                  # Next.js App Router Client
│   ├── src/
│   │   ├── app/               # Next.js Routes & Layouts
│   │   ├── components/        # Reusable React UI Components (Tailwind)
│   │   │   ├── auth/          # Login, Register, OAuth integration components
│   │   │   └── ...
│   │   ├── services/          # API, Auth Actions, and Fetch configurations
│   │   └── lib/               # Utilities, Stores, and Auth Client instances
│   ├── next.config.ts         # Next.js specific configuration & rewrites
│   └── package.json
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── app/
│   │   │   ├── module/        # Modular domain logic (Auth, Posts, Comments, Marketplace)
│   │   │   │   └── auth/      # Controllers, Routes, and Services for Authentication
│   │   │   ├── lib/           # Centralized initializers (Prisma, Socket.IO, BetterAuth)
│   │   │   └── ...
│   │   ├── config/            # Environment variable validation & mappings
│   │   ├── utils/             # Helper classes (Cookies, Tokens, Error handling)
│   │   └── server.ts          # Main Express app and HTTP server initialization
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema definition
│   │   └── seed.ts            # Comprehensive database seeding script
│   └── package.json
│
├── CONTRIBUTING.md            # Guidelines for open-source contributors
└── LICENSE                    # MIT License
```

---

## 💼 Use Cases

1. **Community Builders**: Create niche social networks tailored to specific interests, backed by real-time messaging and notifications.
2. **Creators & Influencers**: Share posts and ephemeral stories to keep your audience engaged.
3. **Digital Entrepreneurs**: Launch a store within the EchoNet Marketplace to sell digital or physical goods directly to your followers utilizing the Stripe integration.

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.17 or higher)
- **pnpm** (preferred package manager)
- **PostgreSQL** database (Local or Cloud like Neon)
- **Cloudinary**, **Stripe**, and **Google Cloud** developer accounts (for API keys)

### 1. Clone the repository
```bash
git clone https://github.com/shakil-ahmed-billal/EchoNet.git
cd EchoNet
```

### 2. Configure the Backend
Navigate to the `backend` directory, install dependencies, and configure your environment:
```bash
cd backend
pnpm install
```

Create a `.env` file in the `backend` directory based on the following template:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/echonet?schema=public"

# Server
PORT=8000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://127.0.0.1:8000"
BETTER_AUTH_URL="http://localhost:3000"
JWT_SECRET="your_super_secret_key"

# Media (Cloudinary)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# OAuth (Better Auth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="..."

# Payments
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
```

**Initialize Database & Seed:**
```bash
pnpm run prisma:generate
pnpm dlx prisma db push
pnpm run seed    # Populates mock users, posts, messages, and marketplace items
```

**Start the Backend Server:**
```bash
pnpm dev
# Server runs gracefully on http://0.0.0.0:8000
```

### 3. Configure the Frontend
Open a new terminal, navigate to the `frontend` directory, install dependencies, and set up your environment:
```bash
cd frontend
pnpm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000"
# Add other necessary public keys (e.g., Stripe publishable key)
```

**Start the Frontend Server:**
```bash
pnpm dev
# Next.js will build and serve the application on http://localhost:3000
```

### 4. Running the Application
Once both servers are running:
1. Open your browser and navigate to `http://localhost:3000`.
2. To test the seed data, you can log in using `admin@echonet.app` (Password: `shakil664`).
3. Enjoy exploring the live feed, socket-connected chats, and the storefront!

---

## 🤝 Contributing

We welcome contributions to make EchoNet better! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Crafted with ❤️ by Shakil Ahmed Billal and contributors.*
