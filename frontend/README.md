# 🎨 Walmart Supply Chain Frontend

A modern React-based frontend application for the Walmart Supply Chain Management System, featuring both admin dashboard and e-commerce customer interfaces with responsive design, intuitive user experience, and comprehensive state management.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API server** running

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── DynamicPricingModule.jsx    # Dynamic pricing interface
│   │   ├── SupplierDashboard.jsx       # Supplier management dashboard
│   │   ├── ProtectedRoute.jsx          # Route protection component
│   │   ├── Ecommerce/                  # E-commerce specific components
│   │   │   ├── EcommerceFooter.jsx     # E-commerce site footer
│   │   │   ├── EcommerceHeader.jsx     # E-commerce site header
│   │   │   └── EcommerceLayout.jsx     # E-commerce layout wrapper
│   │   ├── Layout/                     # Layout components
│   │   │   ├── Header.jsx              # Admin dashboard header
│   │   │   ├── Layout.jsx              # Main admin layout
│   │   │   └── Sidebar.jsx             # Admin navigation sidebar
│   │   └── UI/                         # Base UI components
│   │       ├── Button.jsx              # Reusable button component
│   │       ├── Card.jsx                # Content container component
│   │       ├── LoadingSpinner.jsx      # Loading state indicator
│   │       ├── OrderDetailModal.jsx    # Order details modal
│   │       └── Toast.jsx               # Notification system
│   ├── contexts/                # React contexts for state management
│   │   ├── AuthContext.jsx      # Authentication state management
│   │   ├── CartContext.jsx      # Shopping cart state management
│   │   └── ToastContext.jsx     # Toast notification context
│   ├── pages/                   # Page components
│   │   ├── Ecommerce/           # E-commerce customer pages
│   │   │   ├── CartPage.jsx     # Shopping cart page
│   │   │   ├── CheckoutPage.jsx # Checkout process page
│   │   │   ├── HomePage.jsx     # E-commerce home page
│   │   │   ├── OrderConfirmationPage.jsx # Order confirmation
│   │   │   ├── OrderTrackingPage.jsx     # Order tracking page
│   │   │   ├── ProductDetailPage.jsx     # Product details page
│   │   │   ├── ProductsPage.jsx # Product catalog page
│   │   │   ├── RegisterPage.jsx # User registration page
│   │   │   └── UserProfilePage.jsx      # User profile page
│   │   ├── Analytics.jsx        # Analytics and reporting page
│   │   ├── Dashboard.jsx        # Admin dashboard overview
│   │   ├── Inventory.jsx        # Inventory management page
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── LoginPage.jsx        # User login page
│   │   ├── AdminLoginPage.jsx   # Admin login page
│   │   ├── NotFound.jsx         # 404 error page
│   │   ├── OrderManagement.jsx  # Order management page
│   │   ├── Pricing.jsx          # Pricing management page
│   │   ├── Settings.jsx         # User settings page
│   │   └── Suppliers.jsx        # Supplier management page
│   ├── services/                # API service functions
│   │   ├── orderService.js      # Order-related API calls
│   │   └── productService.js    # Product-related API calls
│   ├── utils/                   # Utility functions
│   │   └── clearOrders.js       # Order clearing utility
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
│   ├── placeholder-logo.png     # Placeholder logo
│   ├── placeholder-logo.svg     # SVG logo
│   ├── placeholder-user.jpg     # User placeholder image
│   ├── placeholder.jpg          # General placeholder
│   └── placeholder.svg          # SVG placeholder
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── index.html                   # HTML entry point
```

## 🎨 Features

### 🔧 Admin Dashboard Features
- **📊 Dashboard**: Real-time overview with key metrics, KPIs, and performance indicators
- **📈 Analytics**: Comprehensive business analytics with interactive charts and data visualization
- **📦 Inventory Management**: Complete product and stock management with reorder alerts
- **📋 Order Management**: Order processing, tracking, and fulfillment system
- **🏢 Supplier Management**: Supplier information, performance tracking, and relationship management
- **💰 Pricing Management**: Dynamic pricing strategies with market analysis
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

### Core Framework
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing with protected routes

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Radix UI**: Accessible component primitives for consistent UI
- **Lucide React**: Beautiful, consistent icons throughout the application
- **Tailwind CSS Animate**: Animation utilities for smooth interactions
- **Class Variance Authority**: Component variant management
- **Tailwind Merge**: Utility class merging for dynamic styling

### State Management
- **React Context**: Built-in state management for global state
- **React Hook Form**: Advanced form handling and validation
- **Zod**: Schema validation for type-safe forms
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Data Visualization
- **Recharts**: Chart library for React with interactive analytics
- **date-fns**: Date manipulation utilities for charts and displays

### Development Tools
- **ESLint**: Code linting with React-specific rules
- **PostCSS**: CSS processing with Autoprefixer
- **Vite**: Fast development server and build tool

### Additional Libraries
- **Sonner**: Toast notification system
- **React Day Picker**: Date picker component
- **Embla Carousel**: Touch-friendly carousel component
- **CMDK**: Command palette component
- **Vaul**: Drawer component for mobile interfaces

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔐 Authentication & Authorization

### User Types
- **Admin Users**: Full access to admin dashboard with all management features
- **Regular Users**: Access to e-commerce features with shopping capabilities

### Protected Routes
- **Admin routes** require admin role authentication
- **E-commerce routes** require user authentication
- **Public routes** available to all users (landing page, login, register)

### Default Admin Credentials
- **Email**: `admin@supply.com`
- **Password**: `admin123`

### Authentication Flow
1. **Login/Register** through dedicated pages
2. **JWT token management** with automatic refresh
3. **Role-based routing** with protected components
4. **Session persistence** across browser sessions

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience with sidebar navigation
- **Tablet**: Optimized layout for medium screens with touch interactions
- **Mobile**: Touch-friendly interface with mobile navigation and gestures

### Responsive Features
- **Mobile-first design** approach
- **Touch-friendly interactions** for mobile devices
- **Adaptive layouts** for different screen sizes
- **Optimized navigation** for mobile users

## 🎯 Key Components

### Layout Components
- **Layout**: Main admin dashboard layout with sidebar and header
- **EcommerceLayout**: E-commerce site layout with header and footer
- **Header**: Navigation and user menu with notifications
- **Sidebar**: Admin navigation menu with collapsible sections
- **Footer**: Site footer with links and information

### UI Components
- **Button**: Reusable button component with multiple variants
- **Card**: Content container component with flexible layouts
- **LoadingSpinner**: Loading state indicator for async operations
- **Toast**: Notification system for user feedback
- **OrderDetailModal**: Modal for detailed order information

### Protected Routes
- **ProtectedRoute**: Route protection with role-based access control
- **AuthContext**: Authentication state management and user session
- **CartContext**: Shopping cart state management and persistence

## 🔄 State Management

### Context Providers
- **AuthContext**: User authentication and authorization state
- **CartContext**: Shopping cart state and operations
- **ToastContext**: Notification system state management

### Local Storage
- **User preferences** and settings
- **Shopping cart data** persistence
- **Authentication tokens** (handled securely by backend)

### State Patterns
- **Custom hooks** for reusable state logic
- **Context providers** for global state
- **Local state** for component-specific data
- **Form state** managed by React Hook Form

## 📊 Data Visualization

### Charts & Analytics
- **Sales Analytics**: Revenue and sales trends with interactive charts
- **Inventory Analytics**: Stock levels and turnover visualization
- **Order Analytics**: Order processing metrics and timelines
- **Customer Analytics**: User behavior and preferences analysis

### Interactive Features
- **Real-time data updates** from API
- **Filterable data tables** with search and sorting
- **Export functionality** for reports and data
- **Custom date ranges** for analytics
- **Interactive charts** with hover effects and tooltips

## 🎨 Styling & Theming

### Design System
- **Consistent color palette** with semantic color usage
- **Typography scale** with proper hierarchy
- **Spacing system** for consistent layouts
- **Component variants** for different use cases

### Tailwind CSS Classes
- **Utility-first approach** for rapid development
- **Responsive design utilities** for all screen sizes
- **Dark mode support** (ready for implementation)
- **Custom animations** and transitions
- **Component-based styling** with consistent patterns

## 🚀 Performance Optimization

### Code Splitting
- **Route-based code splitting** with React Router
- **Lazy loading** for heavy components
- **Dynamic imports** for better initial load times

### Bundle Optimization
- **Tree shaking** for unused code elimination
- **Optimized asset loading** with Vite
- **Compression** for production builds
- **Chunk splitting** for better caching

### Caching Strategy
- **Browser caching** for static assets
- **API response caching** for frequently accessed data
- **Local storage** for user data persistence
- **Service worker** ready for offline functionality

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Walmart Supply Chain
```

### Vite Configuration
- **React plugin** configuration for JSX support
- **Development server** settings with hot reload
- **Build optimization** settings for production
- **Asset handling** for images and static files

### Tailwind Configuration
- **Custom color palette** with brand colors
- **Component variants** for consistent styling
- **Animation utilities** for smooth interactions
- **Responsive breakpoints** for mobile-first design

## 🧪 Development

### Code Style
- **ESLint configuration** with React-specific rules
- **Prettier formatting** for consistent code style
- **React best practices** and conventions
- **Component organization** and file structure

### Component Development
- **Functional components** with modern React hooks
- **Props validation** and TypeScript-ready structure
- **Error boundaries** for graceful error handling
- **Loading states** for better user experience

### Testing Strategy
- **Unit tests** for utility functions and components
- **Integration tests** for user workflows and API calls
- **E2E testing** with Cypress or Playwright (recommended)
- **Accessibility testing** for inclusive design

## 🚀 Deployment

### Build Process
1. **Run build command**: `npm run build`
2. **Deploy dist folder** to hosting service
3. **Configure environment variables** for production
4. **Set up API endpoint URLs** for backend communication

### Hosting Options
- **Vercel**: Recommended for React apps with automatic deployments
- **Netlify**: Easy deployment with Git integration and forms
- **AWS S3**: Static hosting with CloudFront CDN
- **Firebase Hosting**: Google's hosting solution with analytics

### Environment Configuration
- **Production API endpoints** configuration
- **Analytics tracking** setup
- **Error monitoring** and logging
- **Performance monitoring** and optimization

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   ```bash
   # Check backend server is running
   # Verify API URL configuration in .env
   # Check CORS settings on backend
   ```

2. **Authentication Issues**
   ```bash
   # Clear browser cookies and local storage
   # Check JWT token expiration
   # Verify user credentials
   # Check network connectivity
   ```

3. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   npm run clean && npm install
   
   # Check for dependency conflicts
   npm ls
   
   # Verify Node.js version compatibility
   node --version
   ```

4. **Styling Issues**
   ```bash
   # Check Tailwind CSS configuration
   # Verify PostCSS setup
   # Clear browser cache
   # Check for CSS conflicts
   ```

### Development Tips
- **Use React DevTools** for debugging components
- **Check browser console** for JavaScript errors
- **Monitor network tab** for API call issues
- **Test on multiple browsers** for compatibility

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Recharts Documentation](https://recharts.org/)

## 🤝 Contributing

1. **Follow React best practices** and conventions
2. **Use TypeScript** for new components (recommended)
3. **Add proper error handling** and loading states
4. **Include comprehensive testing** for new features
5. **Test on multiple devices** and screen sizes
6. **Update documentation** for new features

### Development Guidelines
- **Component structure** should be consistent
- **State management** should use appropriate patterns
- **Styling** should follow design system guidelines
- **Performance** should be considered for all changes
- **Accessibility** should be maintained for all components

## 📄 License

This project is licensed under the **ISC License**.

## 🆘 Support

For technical support and questions:
1. **Check the troubleshooting section** above
2. **Review the backend API documentation** in backend/README.md
3. **Check browser console** for JavaScript errors
4. **Verify environment configuration** and API endpoints
5. **Ensure all dependencies** are properly installed

### Getting Help
- **Documentation**: Check individual README files
- **Issues**: Review common troubleshooting steps
- **Development**: Use React DevTools and browser tools
- **API Issues**: Verify backend server status and configuration

---

**Built with ❤️ for Walmart Supply Chain Management** 