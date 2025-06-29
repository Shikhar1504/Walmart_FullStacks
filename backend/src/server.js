require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const orderRoutes = require('./routes/order');
const inventoryRoutes = require('./routes/inventory');
const supplierRoutes = require('./routes/supplier');
const analyticsRoutes = require('./routes/analytics');
const pricingRoutes = require('./routes/pricing');
const { validationResult } = require('express-validator');

const app = express();

// Helper functions
const getTimestamp = () => new Date().toISOString();
const sanitizeData = (data) => {
  if (!data) return data;
  const sanitized = { ...data };
  ['password', 'token', 'secret', 'key', 'authorization', 'accessToken', 'refreshToken'].forEach(field => {
    if (sanitized[field]) sanitized[field] = '***HIDDEN***';
  });
  return sanitized;
};
const getClientIP = (req) => req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
const formatHeaders = (headers) => {
  const sanitized = { ...headers };
  ['authorization', 'cookie', 'x-api-key'].forEach(header => {
    if (sanitized[header]) sanitized[header] = '***HIDDEN***';
  });
  return sanitized;
};

const setupMongoDBLogging = () => {
  mongoose.set('debug', () => {});
  mongoose.connection.on('connected', () => {});
  mongoose.connection.on('disconnected', () => {});
  mongoose.connection.on('error', () => {});
  mongoose.connection.on('query', () => {});
};

const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  req.requestId = requestId;
  req.startTime = startTime;

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    originalSend.call(this, data);
  };
  res.json = function (data) {
    return this.send(JSON.stringify(data));
  };
  next();
};

const authLogger = (req, res, next) => next();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 50 to 200
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and certain auth endpoints
    return req.path === '/health' || req.path === '/me';
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and certain endpoints
    return req.path === '/health' || 
           req.path === '/auth/me' || 
           req.path === '/auth/refresh';
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
    allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Rate limiting - only enable in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth', authLimiter);
  app.use('/api', generalLimiter);
}

// Logging middleware
app.use('/api/auth', authLogger);
app.use('/api', apiLogger);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auth session check - bypass rate limiting
app.get('/api/auth/me', authRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pricing', pricingRoutes);

// Validation error handler
app.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Internal Server Error', ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl, method: req.method });
});

const PORT = process.env.PORT || 5000;
setupMongoDBLogging();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(`✅ MongoDB connected successfully`);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error(`❌ MongoDB connection failed:`, err.message);
  process.exit(1);
});

