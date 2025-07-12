# 🛒 Walmart Supply Chain Management System

A comprehensive full-stack application for managing Walmart's supply chain operations, featuring both admin dashboard and e-commerce customer interfaces. This system provides end-to-end supply chain management with real-time analytics, inventory tracking, supplier management, and a complete e-commerce platform.

## 🏗️ Project Overview

This is a modern, scalable supply chain management system built with Node.js/Express backend and React frontend. The system serves two distinct user types:

- **Admin Users**: Complete supply chain management dashboard with analytics, inventory control, supplier management, and pricing strategies
- **E-commerce Customers**: Full-featured online shopping experience with product browsing, cart management, and order tracking

## 📁 Project Structure

```
full_wallmart/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/        # Business logic handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Custom middleware
│   │   ├── validators/        # Input validation
│   │   └── server.js          # Main server file
│   ├── seedDatabase.js        # Database seeding script
│   ├── seedPricingDatabase.js # Pricing data seeding
│   └── package.json           # Backend dependencies
└── frontend/                  # React/Vite frontend application
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── contexts/         # React state management
    │   ├── services/         # API service functions
    │   └── utils/            # Utility functions
    ├── public/               # Static assets
    └── package.json          # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Create and configure environment variables
npm run seed          # Seed the database with initial data
npm run dev           # Start development server
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Start development server
```

## 🎯 Core Features

### 🔧 Admin Dashboard Features

- **📊 Dashboard**: Real-time overview with key metrics, KPIs, and performance indicators
- **📈 Analytics**: Comprehensive business analytics with interactive charts and data visualization
- **📦 Inventory Management**: Complete product and stock management with reorder alerts
- **📋 Order Management**: Order processing, tracking, and fulfillment system
- **🏢 Supplier Management**: Supplier information, performance tracking, and relationship management
- **💰 Pricing Management**: Dynamic pricing strategies with market analysis
- **👥 User Management**: Admin and user account management with role-based access
- **⚙️ Settings**: System configuration and user preferences

### 🛒 E-commerce Customer Features

- **🏠 Home Page**: Featured products, promotions, and personalized recommendations
- **🛍️ Product Catalog**: Advanced product browsing with search, filters, and categories
- **📱 Product Details**: Comprehensive product information, reviews, and related items
- **🛒 Shopping Cart**: Add, remove, and manage cart items with real-time updates
- **💳 Checkout Process**: Secure payment processing and order placement
- **📦 Order Tracking**: Real-time order status updates and delivery tracking
- **👤 User Profile**: Account management, order history, and preferences
- **📱 Responsive Design**: Mobile-first design with touch-friendly interface

## 🔧 Technology Stack

### Backend Technologies

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **JWT** authentication with access and refresh tokens
- **bcryptjs** for secure password hashing
- **express-validator** for comprehensive input validation
- **multer** for file upload handling
- **helmet** for security headers and protection
- **cors** for cross-origin resource sharing
- **express-rate-limit** for API rate limiting
- **morgan** for HTTP request logging
- **cookie-parser** for secure cookie handling

### Frontend Technologies

- **React 18** with modern hooks and concurrent features
- **Vite** for fast development and optimized builds
- **React Router** for client-side navigation
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible component primitives
- **React Hook Form** with Zod for form handling and validation
- **Recharts** for data visualization and analytics
- **Lucide React** for beautiful, consistent icons
- **date-fns** for date manipulation utilities
- **Sonner** for toast notifications

## 🔐 Security & Authentication

### Authentication System

- **JWT-based authentication** with short-lived access tokens (15 minutes)
- **Refresh token mechanism** with 7-day expiry for seamless user experience
- **HTTP-only cookies** for secure token storage
- **Role-based authorization** (admin/user) with protected routes
- **Rate limiting** to prevent brute force attacks
- **Input validation and sanitization** for all user inputs

### Security Features

- **Password hashing** with bcryptjs
- **CORS configuration** for secure cross-origin requests
- **Security headers** with Helmet.js
- **Rate limiting** on authentication endpoints
- **Error handling** without exposing sensitive information

### Default Admin Credentials

- **Email**: `admin@supply.com`
- **Password**: `admin123`

## 📊 API Architecture

### RESTful API Endpoints

#### Authentication & Users

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id` - Update user (Admin)

#### Product Management

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (Admin)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/categories` - Get product categories

#### Order Management

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order (Admin)
- `GET /api/orders/tracking/:trackingNumber` - Track order (Public)

#### Inventory Management

- `GET /api/inventory` - Get inventory data
- `POST /api/inventory` - Update inventory (Admin)
- `GET /api/inventory/:id` - Get inventory by ID

#### Supplier Management

- `GET /api/suppliers` - Get all suppliers (Admin)
- `POST /api/suppliers` - Create new supplier (Admin)
- `GET /api/suppliers/:id` - Get supplier by ID (Admin)
- `PUT /api/suppliers/:id` - Update supplier (Admin)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

#### Analytics & Reporting

- `GET /api/analytics/dashboard` - Dashboard metrics (Admin)
- `GET /api/analytics/sales` - Sales analytics (Admin)
- `GET /api/analytics/inventory` - Inventory analytics (Admin)

#### Pricing Management

- `GET /api/pricing` - Get pricing data
- `POST /api/pricing` - Update pricing (Admin)

## 🛠️ Development Setup

### Environment Variables

#### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/walmart_supply_chain
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Walmart Supply Chain
```

### Available Scripts

#### Backend

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with initial data
```

#### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secrets
4. Configure CORS for production domain
5. Deploy to your preferred hosting service (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment

1. Run `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production API endpoints
4. Set up CDN for static assets

### Recommended Hosting

- **Backend**: Heroku, AWS EC2, DigitalOcean Droplet
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB

## 📈 Performance & Scalability

### Backend Optimization

- **MongoDB connection pooling** for database efficiency
- **Rate limiting** to prevent API abuse
- **Compression middleware** for response optimization
- **Caching strategies** for frequently accessed data
- **Error handling** with proper logging

### Frontend Optimization

- **Code splitting** with React Router
- **Lazy loading** for heavy components
- **Tree shaking** for unused code elimination
- **Image optimization** and lazy loading
- **Service worker** for offline functionality (ready for implementation)

## 🧪 Testing Strategy

### Backend Testing

- **Unit tests** for controllers and utilities
- **Integration tests** for API endpoints
- **Database testing** with test fixtures
- **Security testing** for authentication and authorization

### Frontend Testing

- **Component testing** with React Testing Library
- **Integration tests** for user workflows
- **E2E testing** with Cypress or Playwright
- **Accessibility testing** for inclusive design

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add proper error handling and validation
- Include comprehensive documentation
- Write tests for new features
- Ensure responsive design for all components

## 📝 License

This project is licensed under the **ISC License**.

## 🆘 Support & Documentation

For detailed setup instructions and API documentation:

- **Backend Documentation**: See `backend/README.md`
- **Frontend Documentation**: See `frontend/README.md`
- **API Documentation**: Available at `/api/health` endpoint when server is running

### Getting Help

1. Check the troubleshooting sections in individual README files
2. Review the API endpoints documentation
3. Check browser console and server logs for errors
4. Verify environment configuration
5. Ensure all dependencies are properly installed

---

**Built with ❤️ for Walmart Supply Chain Management**

### Team Members

Sanskar Dubey
Shikhar Sinha
Sachin Kumar
Poorvi Mishra
