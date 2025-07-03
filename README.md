# 🛍️ Clothing Backend API

A comprehensive and scalable backend API for a clothing e-commerce platform built with Node.js, Express, and MongoDB. This API supports multi-role user management, complete order processing, inventory management, and advanced features like analytics, marketing tools, and vendor management.

## 🚀 Features

### Core Features
- **Multi-role Authentication & Authorization** (Admin, Vendor, Customer)
- **Complete Product Management** (Categories, Brands, Inventory, Reviews)
- **Advanced Order Processing** (Cart, Orders, Bulk Orders, Refunds)
- **Payment Integration** (Payments, Transactions, Tax Calculation)
- **User Management** (Profiles, Addresses, Feedback, Wishlist)
- **Vendor/Merchant System** (Multi-vendor support)
- **Marketing Tools** (Coupons, Advertisements, SEO Metadata)
- **Analytics & Reporting** (Activity tracking, Audit logs)
- **Content Management** (Banners, FAQs, Notifications)
- **Shipping Management** (Shipping methods and calculations)

### Technical Features
- **RESTful API Design** with proper HTTP methods and status codes
- **MongoDB Integration** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **File Upload Support** with Cloudinary integration
- **Rate Limiting** for API protection
- **CORS Configuration** for cross-origin requests
- **Input Validation** and error handling
- **Audit Logging** for security and compliance
- **Email Integration** with Nodemailer
- **Image Processing** with Cloudinary
- **Session Management** with Express sessions

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Security**: bcrypt, CORS, Rate Limiting
- **Development**: Nodemon, Prettier

## 📦 Dependencies

### Core Dependencies
- **express**: Fast, unopinionated web framework
- **mongoose**: MongoDB object modeling
- **jsonwebtoken**: JWT implementation
- **bcrypt**: Password hashing
- **cloudinary**: Cloud-based image management
- **nodemailer**: Email sending
- **cors**: Cross-origin resource sharing
- **multer**: File upload middleware
- **cookie-parser**: Cookie parsing middleware
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Auto-restart development server
- **prettier**: Code formatting

## 🏗️ Project Structure

```
src/
├── controllers/          # Request handlers organized by feature
│   ├── adminController/     # Admin-specific operations
│   ├── catalogController/   # Product catalog management
│   ├── marketingController/ # Marketing and promotions
│   ├── orderController/     # Order processing
│   ├── paymentController/   # Payment handling
│   ├── systemController/    # System utilities
│   ├── userController/      # User management
│   └── vendorController/    # Vendor operations
├── Models/               # MongoDB schemas
│   ├── adminmodels/        # Admin-related models
│   ├── catalogModels/      # Product and inventory models
│   ├── marketingModels/    # Marketing-related models
│   ├── orderModels/        # Order and cart models
│   ├── paymentModels/      # Payment and transaction models
│   ├── systemModels/       # System and analytics models
│   ├── userModels/         # User-related models
│   └── vendorModels/       # Vendor and merchant models
├── routes/               # API route definitions
├── middlewares/          # Custom middleware functions
├── helpers/              # Utility functions
├── utils/                # Common utilities
├── db/                   # Database connection
├── app.js                # Express app configuration
├── index.js              # Application entry point
└── constants.js          # Application constants
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account (for image uploads)
- Email service for notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clothing_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   DOMAIN=http://localhost:3000

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   TOKEN_SECRET=your_jwt_secret_key
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=10d

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration
   EMAIL_HOST=your_email_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_email_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Product Management
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get specific product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Management
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id` - Update order status

### Cart Operations
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address

*For complete API documentation, consider using tools like Swagger or Postman collections.*

## 🔧 Key Features Explained

### Multi-Role System
The application supports three main user roles:
- **Admin**: Full system access, user management, content management
- **Vendor**: Product management, order fulfillment, inventory control
- **Customer**: Shopping, order tracking, profile management

### Analytics & Tracking
- Real-time analytics tracking for user behavior
- Audit logging for all critical operations
- Performance metrics and reporting

### Payment Processing
- Secure payment handling with transaction logging
- Tax calculation based on location and product type
- Refund management with automated processing

### Marketing Tools
- Coupon and discount management
- Advertisement system
- SEO metadata management for products

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** and sanitization
- **Audit Logging** for security monitoring

## 🧪 Development

### Running in Development Mode
```bash
npm run dev
```

### Code Formatting
```bash
npx prettier --write .
```

### Environment Variables
Make sure to set up all required environment variables before running the application. Check the `.env.example` file for reference.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use Prettier for code formatting
- Follow existing naming conventions
- Write descriptive commit messages
- Add comments for complex logic

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

- [ ] API versioning implementation
- [ ] GraphQL integration
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app API optimization
- [ ] Third-party integrations (payment gateways, shipping providers)

## 🏆 Acknowledgments

- Express.js community for the excellent framework
- MongoDB team for the robust database solution
- All contributors and maintainers

---

**Happy Coding! 🚀**

*For detailed API documentation and examples, please refer to the API documentation or contact the development team.*
