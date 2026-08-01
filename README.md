# 🌾 AROVASTORE

A comprehensive agricultural marketplace platform that connects farmers directly with buyers, eliminating middlemen and ensuring fair prices for fresh produce.

## 🚀 Features

### Core Functionalities
- **🔥 Top 8 Most Demanded Crops**: AI-powered demand analysis showing trending crops by location
- **🛒 Marketplace Module**: Browse and search crops with advanced filtering
- **👨‍🌾 Farmer Dashboard**: Add, edit, and manage crop listings
- **🧑‍🌾 Consumer Dashboard**: Track orders and manage purchases
- **💳 UPI Payment Integration**: Secure payments with QR code scanning
- **🧾 Digital Receipts**: Automated receipt generation with all transaction details
- **🔐 Secure Authentication**: JWT-based auth with forgot password functionality
- **📧 Email Verification**: OTP-based email verification using Nodemailer

### User Roles
- **Farmers**: Can list crops, manage inventory, and track orders
- **Consumers**: Can browse marketplace, place orders, and track purchases

## 🛠️ Technology Stack & Implementation

### Frontend Technologies

#### **React 18** with Vite
**Why Used:**
- Modern, component-based architecture for building interactive UIs
- Virtual DOM for optimal performance
- Large ecosystem and community support
- Vite provides lightning-fast HMR (Hot Module Replacement) for development

**How Implemented:**
- Component-based architecture with reusable UI components
- Functional components with React Hooks (useState, useEffect, useContext)
- Client-side routing with React Router v6
- State management using Zustand store for authentication
- Form handling with controlled components
- Conditional rendering for dynamic UI updates

**Key Files:**
- `frontend/src/App.jsx` - Main application component with routing
- `frontend/src/pages/` - Page components (Login, Register, Dashboards, etc.)
- `frontend/src/components/` - Reusable components
- `frontend/src/store/useAuthStore.js` - Zustand store for auth state

#### **React Router v6**
**Why Used:**
- Declarative routing for single-page applications
- Nested routes and route parameters
- Programmatic navigation
- Protected routes for authentication

**How Implemented:**
- Route configuration in `App.jsx`
- Protected routes for dashboards (farmer/consumer)
- Route parameters for dynamic pages (crop details, order confirmation)
- Navigation hooks (useNavigate, useLocation) for programmatic navigation
- State-based navigation (passing email to reset password page)

**Key Routes:**
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page
- `/marketplace` - Marketplace browsing
- `/farmer-dashboard` - Farmer dashboard (protected)
- `/consumer-dashboard` - Consumer dashboard (protected)

#### **Tailwind CSS**
**Why Used:**
- Utility-first CSS framework for rapid UI development
- Responsive design out of the box
- Small bundle size with tree-shaking
- Consistent design system
- No need for custom CSS files

**How Implemented:**
- Utility classes for styling (flex, grid, colors, spacing)
- Responsive breakpoints (sm, md, lg, xl)
- Custom color palette for brand consistency
- DaisyUI components for pre-built UI elements
- Dark mode support (if needed in future)

**Key Features:**
- Responsive grid layouts for dashboards
- Mobile-first design approach
- Consistent spacing and typography
- Hover states and transitions

#### **Lucide React**
**Why Used:**
- Lightweight icon library
- Tree-shakeable for optimal bundle size
- Consistent icon style
- Easy to customize with Tailwind classes

**How Implemented:**
- Import specific icons to minimize bundle size
- Used in buttons, navigation, and UI elements
- Styled with Tailwind classes for size and color
- Icons for: User, Mail, Lock, Shopping Cart, Package, etc.

#### **Axios**
**Why Used:**
- Promise-based HTTP client for API calls
- Automatic JSON transformation
- Request/response interceptors
- Better error handling than fetch
- Support for request cancellation

**How Implemented:**
- Custom axios instance in `frontend/src/lib/axios.js`
- Base URL configuration for API calls
- `withCredentials: true` for cookie-based authentication
- Error handling in try-catch blocks
- Used in all API calls (auth, crops, orders)

**Configuration:**
```javascript
axios.create({
  baseURL: 'http://localhost:5002',
  withCredentials: true // Important for JWT cookies
})
```

#### **Zustand**
**Why Used:**
- Lightweight state management solution
- Simple API compared to Redux
- No boilerplate code
- Excellent TypeScript support
- Performance optimized with selectors

**How Implemented:**
- Authentication state management in `useAuthStore.js`
- Global auth state (authUser, isCheckingAuth, isSigningUp)
- Auth actions (signup, login, logout, checkAuth)
- Persistent auth across page refreshes
- Error handling with toast notifications

**State Structure:**
```javascript
{
  authUser: user object | null,
  isCheckingAuth: boolean,
  isSigningUp: boolean,
  signup: async function,
  login: async function,
  logout: async function,
  checkAuth: async function
}
```

#### **React Hot Toast**
**Why Used:**
- Beautiful toast notifications
- Easy to use API
- Customizable appearance
- Promise-based for async operations
- No layout shift

**How Implemented:**
- Success/error notifications for auth operations
- Feedback for form submissions
- Error messages from API responses
- Auto-dismissal after timeout

### Backend Technologies

#### **Node.js with Express.js**
**Why Used:**
- Fast, scalable server-side JavaScript runtime
- Non-blocking I/O for high performance
- Large npm ecosystem
- Express provides robust routing and middleware
- Easy integration with databases and APIs

**How Implemented:**
- RESTful API architecture
- Modular route structure (auth, crops, orders, users)
- Middleware for authentication, validation, error handling
- CORS configuration for frontend-backend communication
- Cookie management for JWT tokens

**Key Files:**
- `backend/src/server.js` - Express server setup
- `backend/src/routes/` - API route definitions
- `backend/src/controllers/` - Business logic
- `backend/src/middleware/` - Custom middleware

**Server Configuration:**
```javascript
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

#### **MongoDB with Mongoose ODM**
**Why Used:**
- NoSQL database for flexible schema design
- Scalable for large datasets
- Mongoose provides schema validation and modeling
- Rich query capabilities
- Good for hierarchical data (crops, orders, users)

**How Implemented:**
- Schema definitions in `backend/src/models/`
- User model with authentication fields
- Crop model with inventory management
- Order model with payment tracking
- Indexing for query optimization
- Virtual fields for computed properties

**Key Models:**
- **User**: name, email, password, role, phone, address, upiId, upiQrCode
- **Crop**: name, price, quantity, description, category, location, image, farmer
- **Order**: crop, consumer, farmer, quantity, totalPrice, status, payment

**Schema Features:**
- Unique indexes on email
- Pre-save hooks for password hashing
- Virtual fields for formatted data
- Population for related documents

#### **JWT (JSON Web Tokens)**
**Why Used:**
- Stateless authentication
- Secure token-based auth
- No session storage needed
- Works well with HTTP-only cookies
- Cross-domain support

**How Implemented:**
- Token generation on login/registration
- HTTP-only cookie for secure storage
- Token verification in protected routes
- Automatic token refresh
- 7-day token expiration

**Token Structure:**
```javascript
{
  userId: user._id,
  iat: timestamp,
  exp: expiration_timestamp
}
```

**Cookie Configuration:**
```javascript
res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true, // Prevent XSS
  sameSite: "lax", // CSRF protection
  secure: process.env.NODE_ENV === "production"
})
```

#### **bcryptjs**
**Why Used:**
- Secure password hashing
- Salt rounds for added security
- One-way hashing (cannot be decrypted)
- Industry standard for password security

**How Implemented:**
- Password hashing before saving to database
- Password comparison during login
- 10 salt rounds for optimal security
- Pre-save hook in User model

**Usage:**
```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
const isMatch = await bcrypt.compare(password, hashedPassword);
```

#### **Multer with Cloudinary**
**Why Used:**
- Multer: Handle multipart/form-data for file uploads
- Cloudinary: Cloud image storage with CDN
- Automatic image optimization
- Secure file handling
- Scalable storage solution

**How Implemented:**
- Multer middleware for file upload handling
- Cloudinary storage configuration
- Image upload to cloud with folder organization
- URL generation for stored images
- File size and format validation

**Configuration:**
```javascript
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agri-marketplace/crops',
    allowed_formats: ['jpg', 'png', 'webp'],
    public_id: (req, file) => file.originalname
  }
})
```

#### **Express Validator**
**Why Used:**
- Request validation middleware
- Sanitization of user input
- Custom validation rules
- Error message customization
- Prevents invalid data from reaching controllers

**How Implemented:**
- Validation rules in route definitions
- Chainable validation methods
- Custom error messages
- Sanitization of input data
- Validation middleware before controllers

**Example:**
```javascript
[
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]
```

#### **Nodemailer**
**Why Used:**
- Email sending capability for OTP
- Support for multiple email providers
- HTML email templates
- Secure SMTP authentication
- Reliable email delivery

**How Implemented:**
- SMTP transporter configuration
- OTP email template with HTML styling
- Email sending for forgot password flow
- Error handling for failed emails
- Environment-based configuration

**Configuration:**
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

#### **Cookie Parser**
**Why Used:**
- Parse Cookie header for JWT tokens
- Access cookies in req.cookies
- Essential for HTTP-only cookie authentication
- Signed cookie support

**How Implemented:**
- Middleware in Express app
- Access JWT token from cookies
- Token verification in protected routes
- Cookie clearing on logout

#### **CORS (Cross-Origin Resource Sharing)**
**Why Used:**
- Enable cross-origin requests from frontend
- Security for API access
- Credential support for cookies
- Whitelist allowed origins

**How Implemented:**
- CORS middleware in Express
- Credentials enabled for cookie support
- Origin whitelisting for security
- Support for preflight requests

**Configuration:**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.vercel.app'],
  credentials: true
}))
```

### Database & Third-Party Services

#### **MongoDB Atlas**
**Why Used:**
- Cloud-hosted MongoDB database
- Automatic backups and scaling
- High availability and redundancy
- Free tier for development
- Easy integration with Node.js

**How Implemented:**
- Connection string in environment variables
- Mongoose connection in `db.js`
- Cluster configuration for performance
- Index optimization for queries
- Connection pooling

#### **Cloudinary**
**Why Used:**
- Cloud image storage with CDN
- Automatic image optimization
- Multiple format support
- Secure delivery with HTTPS
- Generous free tier

**How Implemented:**
- Image upload for crop photos
- QR code storage for UPI payments
- Folder organization for different image types
- URL generation for frontend display
- Image transformation capabilities

**Features Used:**
- Auto-upload from Multer
- Format conversion (webp optimization)
- Responsive image URLs
- Secure delivery with signed URLs

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Gmail account with app password (for Nodemailer)
- Cloudinary account (for image storage)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd agri-marketplace
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, backend, frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/agri-marketplace
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5002

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Getting Gmail App Password:**
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Use this password in EMAIL_PASSWORD field

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas and update the MONGODB_URI in .env
```

### 5. Start the Application

#### Development Mode (Recommended)
```bash
# Start both backend and frontend concurrently
npm run dev
```

#### Manual Start
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002

## 📁 Project Structure

```
agri-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (Cloudinary, etc.)
│   │   ├── controllers/     # Business logic (auth, crops, orders, users)
│   │   ├── lib/             # Utility functions (db, utils, cloudinary)
│   │   ├── middleware/      # Custom middleware (auth, validation)
│   │   ├── models/          # MongoDB models (User, Crop, Order)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # External services (OTP service)
│   │   └── server.js        # Express server entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React contexts (AuthContext)
│   │   ├── lib/             # Utility functions (axios)
│   │   ├── pages/           # Page components (Home, Login, Dashboards, etc.)
│   │   ├── store/           # State management (useAuthStore)
│   │   ├── App.jsx          # Main App component with routing
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
├── DEPLOYMENT.md            # Deployment guide
├── README.md                # This file
└── package.json             # Root package.json
```

## 🔐 Authentication & Authorization

### User Registration
- Users can register as either **Farmer** or **Consumer**
- Role-based access control for different features
- Email verification with case-insensitive duplicate check
- Secure password hashing with bcryptjs
- Address information (state, district, village, pincode)

### JWT Authentication
- Secure token-based authentication with HTTP-only cookies
- Protected routes for different user roles
- 7-day token expiration
- Automatic authentication check on app load
- Cookie security: httpOnly, sameSite: lax, secure in production

### Forgot Password Flow
1. User enters email on forgot password page
2. System validates email exists in database
3. OTP is generated and sent via Nodemailer
4. User enters OTP and new password
5. System verifies OTP and updates password
6. User is redirected to login page

### OTP System
- 6-digit OTP generation using crypto
- 10-minute expiration time
- Maximum 3 verification attempts
- 1-minute cooldown between OTP requests
- In-memory storage (can be replaced with Redis in production)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with role selection
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/logout` - User logout (clears JWT cookie)
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/forgot-password` - Send OTP for password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Crops
- `GET /api/crops` - Get all crops with filters (location, category, price)
- `GET /api/crops/top-demanded` - Get top 8 demanded crops by location
- `POST /api/crops` - Add new crop (Farmer only, with image upload)
- `PUT /api/crops/:id` - Update crop details (Farmer only)
- `DELETE /api/crops/:id` - Delete crop listing (Farmer only)
- `GET /api/crops/my-crops` - Get farmer's crop listings

### Orders
- `POST /api/orders` - Create new order (Consumer only)
- `GET /api/orders/my-orders` - Get consumer's order history
- `GET /api/orders/farmer-orders` - Get farmer's received orders
- `PUT /api/orders/:id/status` - Update order status (Farmer only)
- `PUT /api/orders/:id/payment` - Confirm payment (Consumer only)
- `GET /api/orders/:id/receipt` - Download digital receipt

### Users
- `GET /api/users/profile` - Get user profile details
- `PUT /api/users/profile` - Update user profile information
- `POST /api/users/upload-upi-qr` - Upload UPI QR code for payments
- `GET /api/users/farmers` - Get all registered farmers

## 💳 Payment Flow

1. **Order Placement**: Consumer places order and gets UPI QR code
2. **Payment**: Consumer scans QR code using any UPI app
3. **Confirmation**: Consumer confirms payment after successful transaction
4. **Receipt Generation**: Digital receipt is generated automatically
5. **Order Tracking**: Both farmer and consumer can track order status

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Real-time Updates**: Dynamic content updates without page refresh
- **Search & Filter**: Advanced filtering for crops by location, price, category
- **Interactive Dashboard**: Role-based dashboards with relevant information
- **Toast Notifications**: User feedback for all actions using react-hot-toast
- **Loading States**: Visual feedback during API calls and data loading
- **Error Handling**: Clear error messages and validation feedback
- **Logout Functionality**: Easy logout from dashboards with confirmation

## 🔧 Development Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
cd frontend && npm run build
```

## 📝 Demo Accounts

For testing purposes, you can use these demo accounts:

**Farmer Account:**
- Email: farmer@demo.com
- Password: demo123

**Consumer Account:**
- Email: consumer@demo.com
- Password: demo123

## 🌟 Key Features Explained

### Top 8 Most Demanded Crops
- AI-powered analysis based on:
  - Real-time market trends
  - Sales frequency
  - Price dynamics
  - Location-specific demand
- Filterable by state, district, and village
- Helps farmers make informed planting decisions
- Consumers can see trending crops in their area

### Marketplace Features
- Advanced search with multiple filters (location, category, price range)
- Grid and list views for different browsing preferences
- Real-time inventory updates
- Farmer information and contact details
- Add to cart functionality with localStorage persistence
- Custom event system for cart state synchronization

### Farmer Dashboard
- Crop management (add, edit, delete with image upload)
- Order tracking with status updates
- Sales analytics with stats cards
- Inventory management
- UPI QR code upload for payments
- Logout functionality for secure session management

### Consumer Dashboard
- Order history with detailed tracking
- Payment tracking and confirmation
- Receipt downloads for transactions
- Shopping cart management
- Order status updates (pending, confirmed, completed, cancelled)
- Logout functionality for secure session management

### Authentication System
- Secure registration with role selection (farmer/consumer)
- Email validation with case-insensitive duplicate check
- Password hashing with bcryptjs
- JWT-based authentication with HTTP-only cookies
- Forgot password with OTP verification
- Session persistence across page refreshes
- Protected routes for dashboards

## 🚀 Deployment

For detailed deployment instructions, refer to the [DEPLOYMENT.md](DEPLOYMENT.md) file which includes:

### Frontend Deployment (Vercel)
- Vercel project configuration
- Build settings for Vite
- Environment variables setup
- Auto-deployment from GitHub

### Backend Deployment (Render)
- MongoDB Atlas setup
- Cloudinary configuration
- Nodemailer email setup
- Render web service configuration
- Environment variables setup

### MongoDB Setup
- Use MongoDB Atlas for cloud deployment
- Update MONGODB_URI in production environment
- Ensure proper indexing for performance
- Configure IP whitelisting for Render

### Cloudinary Setup
- Create Cloudinary account
- Configure upload folder
- Set up API credentials
- Configure allowed formats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For any issues or questions, please open an issue on GitHub or contact the development team.

## 🎯 Future Enhancements

- [ ] Real-time chat between farmers and buyers
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with payment gateways beyond UPI
- [ ] Crop quality certification system
- [ ] Logistics and delivery integration
- [ ] Multi-language support
- [ ] Advanced recommendation engine

---

**Built with ❤️ for the farming community**
