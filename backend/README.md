# 🔧 Backend API Server

A robust Node.js/Express API server for the Walmart Supply Chain Management System, featuring secure authentication, comprehensive CRUD operations, real-time data management, and advanced analytics capabilities.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/walmart_supply_chain
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_long_and_secure
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database with initial data
   npm run seed
   ```

4. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/           # Business logic handlers
│   │   ├── analyticsController.js    # Analytics and reporting logic
│   │   ├── authController.js         # Authentication and user management
│   │   ├── categoryController.js     # Product category management
│   │   ├── dashboardController.js    # Dashboard metrics and KPIs
│   │   ├── inventoryController.js    # Inventory management logic
│   │   ├── orderController.js        # Order processing and tracking
│   │   ├── pricingController.js      # Dynamic pricing strategies
│   │   ├── productController.js      # Product management logic
│   │   ├── supplierController.js     # Supplier relationship management
│   │   └── userController.js         # User account management
│   ├── middleware/            # Custom middleware
│   │   ├── authMiddleware.js  # JWT authentication middleware
│   │   └── multer.js          # File upload middleware
│   ├── models/               # MongoDB schemas
│   │   ├── Category.js       # Product category schema
│   │   ├── Inventory.js      # Inventory tracking schema
│   │   ├── Order.js          # Order management schema
│   │   ├── Pricing.js        # Pricing strategy schema
│   │   ├── Product.js        # Product information schema
│   │   ├── Supplier.js       # Supplier information schema
│   │   └── User.js           # User account schema
│   ├── routes/               # API route definitions
│   │   ├── analytics.js      # Analytics endpoints
│   │   ├── auth.js           # Authentication routes
│   │   ├── category.js       # Category management routes
│   │   ├── inventory.js      # Inventory management routes
│   │   ├── order.js          # Order management routes
│   │   ├── pricing.js        # Pricing management routes
│   │   ├── product.js        # Product management routes
│   │   ├── supplier.js       # Supplier management routes
│   │   └── user.js           # User management routes
│   ├── validators/           # Input validation schemas
│   │   └── authValidator.js  # Authentication validation
│   └── server.js             # Main server file
├── seedDatabase.js           # Database seeding script
├── seedPricingDatabase.js    # Pricing data seeding script
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔐 Authentication System

### Features
- ✅ **JWT-based authentication** with access and refresh tokens
- ✅ **Role-based authorization** (admin/user) with protected routes
- ✅ **HTTP-only cookies** for secure token storage
- ✅ **Password hashing** with bcrypt for security
- ✅ **Input validation** with express-validator
- ✅ **Rate limiting** to prevent brute force attacks
- ✅ **CORS configuration** for frontend integration
- ✅ **Security headers** with Helmet.js

### Default Admin Credentials
- **Email**: `admin@supply.com`
- **Password**: `admin123`
- **Role**: `admin`

### Security Features
- **Token Security**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Rate Limiting**: Authentication endpoints limited to 200 requests per 15 minutes
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Secure error messages without exposing sensitive information
- **CORS Protection**: Configured for specific origins only

## 📊 API Endpoints

### Authentication & User Management
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/auth/register` | User registration | No | - |
| POST | `/api/auth/login` | User login | No | - |
| POST | `/api/auth/logout` | User logout | Yes | Any |
| GET | `/api/auth/me` | Get current user info | Yes | Any |
| POST | `/api/auth/refresh-token` | Refresh access token | Yes | Any |
| GET | `/api/users` | Get all users | Yes | Admin |
| GET | `/api/users/:id` | Get user by ID | Yes | Admin |
| PUT | `/api/users/:id` | Update user | Yes | Admin |

### Product Management
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/products` | Get all products | Yes | Any |
| POST | `/api/products` | Create new product | Yes | Admin |
| GET | `/api/products/:id` | Get product by ID | Yes | Any |
| PUT | `/api/products/:id` | Update product | Yes | Admin |
| DELETE | `/api/products/:id` | Delete product | Yes | Admin |
| GET | `/api/categories` | Get product categories | Yes | Any |
| POST | `/api/categories` | Create category | Yes | Admin |

### Order Management
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/orders` | Get all orders | Yes | Any |
| POST | `/api/orders` | Create new order | Yes | Any |
| GET | `/api/orders/:id` | Get order by ID | Yes | Any |
| PUT | `/api/orders/:id` | Update order | Yes | Admin |
| GET | `/api/orders/tracking/:trackingNumber` | Track order | No | - |

### Inventory Management
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/inventory` | Get inventory data | Yes | Any |
| POST | `/api/inventory` | Update inventory | Yes | Admin |
| GET | `/api/inventory/:id` | Get inventory by ID | Yes | Any |
| PUT | `/api/inventory/:id` | Update inventory item | Yes | Admin |

### Supplier Management
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/suppliers` | Get all suppliers | Yes | Admin |
| POST | `/api/suppliers` | Create new supplier | Yes | Admin |
| GET | `/api/suppliers/:id` | Get supplier by ID | Yes | Admin |
| PUT | `/api/suppliers/:id` | Update supplier | Yes | Admin |
| DELETE | `/api/suppliers/:id` | Delete supplier | Yes | Admin |

### Analytics & Reporting
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/analytics/dashboard` | Dashboard metrics | Yes | Admin |
| GET | `/api/analytics/sales` | Sales analytics | Yes | Admin |
| GET | `/api/analytics/inventory` | Inventory analytics | Yes | Admin |
| GET | `/api/analytics/suppliers` | Supplier analytics | Yes | Admin |

### Pricing Management
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/pricing` | Get pricing data | Yes | Any |
| POST | `/api/pricing` | Update pricing | Yes | Admin |
| GET | `/api/pricing/strategies` | Get pricing strategies | Yes | Admin |
| POST | `/api/pricing/strategies` | Create pricing strategy | Yes | Admin |

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with initial data
npm test         # Run tests (placeholder)
```

## 🔧 Dependencies

### Core Dependencies
- **express**: Web framework for building APIs
- **mongoose**: MongoDB ODM for database operations
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification
- **express-validator**: Input validation and sanitization
- **multer**: File upload handling middleware
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers middleware
- **morgan**: HTTP request logging
- **cookie-parser**: Cookie parsing middleware
- **express-rate-limit**: Rate limiting for API protection
- **dotenv**: Environment variable management
- **node-fetch**: HTTP client for external API calls
- **uuid**: Unique identifier generation

### Development Dependencies
- **nodemon**: Auto-restart server during development

## 🗄️ Database Models

### User Model (`User.js`)
- **Authentication fields**: email, password (hashed)
- **Role-based access control**: admin/user roles
- **Profile information**: name, phone, address
- **Account management**: created/updated timestamps
- **Security features**: password reset functionality

### Product Model (`Product.js`)
- **Product details**: name, description, price, images
- **Inventory tracking**: stock levels, reorder points
- **Supplier relationships**: supplier references
- **Category classification**: category assignments
- **Metadata**: SKU, barcode, dimensions, weight

### Order Model (`Order.js`)
- **Order items**: product references and quantities
- **Customer information**: shipping and billing details
- **Tracking numbers**: unique order identifiers
- **Status management**: order lifecycle tracking
- **Payment information**: payment status and method

### Supplier Model (`Supplier.js`)
- **Supplier information**: name, contact details
- **Performance metrics**: delivery times, quality ratings
- **Business details**: address, phone, email
- **Relationship management**: contract terms and conditions

### Inventory Model (`Inventory.js`)
- **Stock levels**: current quantity tracking
- **Reorder points**: automatic reorder triggers
- **Location tracking**: warehouse and shelf locations
- **Movement history**: stock in/out transactions

### Pricing Model (`Pricing.js`)
- **Dynamic pricing**: market-based price adjustments
- **Strategy management**: pricing rules and conditions
- **Historical data**: price change tracking
- **Competitive analysis**: market price monitoring

### Category Model (`Category.js`)
- **Product categorization**: hierarchical category structure
- **Category management**: add, edit, delete categories
- **Product relationships**: category-product associations

## 🔒 Security Features

### 1. Authentication & Authorization
- **JWT tokens** with short expiry times for security
- **Role-based access control** with admin/user permissions
- **Secure password hashing** with bcrypt
- **HTTP-only cookies** for token storage
- **Token refresh mechanism** for seamless user experience

### 2. Input Validation & Sanitization
- **Comprehensive validation** for all endpoints
- **Input sanitization** to prevent injection attacks
- **Type checking** and format validation
- **Custom validation rules** for business logic

### 3. Rate Limiting & Protection
- **Authentication endpoints**: 200 requests per 15 minutes
- **General API**: 500 requests per 15 minutes
- **Configurable limits** per environment
- **IP-based limiting** for security

### 4. Security Headers & CORS
- **Helmet.js** for security headers
- **CORS configuration** for specific origins
- **Content Security Policy** implementation
- **XSS protection** and other security measures

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
CORS_ORIGIN=https://your-frontend-domain.com
PORT=5000
```

### Security Considerations
- **Strong JWT secrets** with high entropy
- **HTTPS enforcement** in production
- **Secure cookie flags** for token storage
- **Rate limiting monitoring** and alerts
- **Regular security audits** and updates
- **Database connection pooling** for performance

### Performance Optimization
- **MongoDB connection pooling** for efficiency
- **Caching strategies** for frequently accessed data
- **Compression middleware** for response optimization
- **Memory usage monitoring** and optimization
- **Proper error handling** with logging

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Ensure MongoDB is running
   mongod
   
   # Check MONGODB_URI in .env file
   # Verify network connectivity
   ```

2. **CORS Errors**
   ```bash
   # Check CORS_ORIGIN in .env file
   # Ensure frontend URL matches
   # Verify credentials setting
   ```

3. **Authentication Failures**
   ```bash
   # Check JWT_SECRET and JWT_REFRESH_SECRET
   # Verify cookie settings
   # Check token expiration
   ```

4. **Rate Limiting**
   ```bash
   # Wait 15 minutes for auth endpoints
   # Check request frequency
   # Verify IP address
   ```

## 📝 API Testing

### Using curl

1. **Test Admin Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@supply.com","password":"admin123"}' \
     -c cookies.txt
   ```

2. **Test Protected Endpoint**
   ```bash
   curl -X GET http://localhost:5000/api/products \
     -b cookies.txt
   ```

3. **Test Order Tracking**
   ```bash
   curl -X GET http://localhost:5000/api/orders/tracking/test123
   ```

### Using Postman
1. Import the API collection
2. Set up environment variables
3. Configure authentication headers
4. Test all endpoints systematically

## 📊 Database Seeding

### Initial Data Setup
```bash
# Seed main database
npm run seed

# Seed pricing data
node seedPricingDatabase.js
```

### Seeded Data Includes
- **Admin user** with default credentials
- **Sample products** with categories
- **Supplier information** for testing
- **Inventory records** with stock levels
- **Pricing strategies** for dynamic pricing
- **Sample orders** for order management

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

1. **Follow** the existing code style and patterns
2. **Add** proper error handling and validation
3. **Include** comprehensive input validation
4. **Write** tests for new features
5. **Update** documentation for API changes

### Code Standards
- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Add input validation for all endpoints
- Use meaningful variable and function names

## 📄 License

This project is licensed under the **ISC License**.

---

**Built with ❤️ for Walmart Supply Chain Management** 