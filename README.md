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

### User Roles
- **Farmers**: Can list crops, manage inventory, and track orders
- **Consumers**: Can browse marketplace, place orders, and track purchases

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router** for navigation
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

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
MONGODB_URI=mongodb://localhost:27017/agri-marketplace
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5000
```

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
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
agri-marketplace/
├── backend/
│   ├── models/          # MongoDB models (User, Crop, Order)
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # File upload directory
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   ├── public/
│   └── package.json
├── README.md
└── package.json
```

## 🔐 Authentication & Authorization

### User Registration
- Users can register as either **Farmer** or **Consumer**
- Role-based access control for different features
- Email verification and secure password hashing

### JWT Authentication
- Secure token-based authentication
- Protected routes for different user roles
- Automatic token refresh

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Crops
- `GET /api/crops` - Get all crops with filters
- `GET /api/crops/top-demanded` - Get top 8 demanded crops
- `POST /api/crops` - Add new crop (Farmer only)
- `PUT /api/crops/:id` - Update crop (Farmer only)
- `DELETE /api/crops/:id` - Delete crop (Farmer only)
- `GET /api/crops/my-crops` - Get farmer's crops

### Orders
- `POST /api/orders` - Create new order (Consumer only)
- `GET /api/orders/my-orders` - Get consumer's orders
- `GET /api/orders/farmer-orders` - Get farmer's orders
- `PUT /api/orders/:id/status` - Update order status (Farmer only)
- `PUT /api/orders/:id/payment` - Confirm payment (Consumer only)
- `GET /api/orders/:id/receipt` - Download receipt

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-upi-qr` - Upload UPI QR code
- `GET /api/users/farmers` - Get all farmers

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

### Marketplace Features
- Advanced search with multiple filters
- Grid and list views
- Real-time inventory updates
- Farmer information and contact details
- Add to cart functionality

### Farmer Dashboard
- Crop management (add, edit, delete)
- Order tracking
- Sales analytics
- Inventory management
- UPI QR code upload

### Consumer Dashboard
- Order history
- Payment tracking
- Receipt downloads
- Shopping cart management
- Order status updates

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Heroku/Railway)
```bash
cd backend
# Set environment variables
# Deploy using platform-specific commands
```

### MongoDB Setup
- Use MongoDB Atlas for cloud deployment
- Update MONGODB_URI in production environment
- Ensure proper indexing for performance

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
