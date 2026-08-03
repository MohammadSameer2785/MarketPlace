# Deployment Guide

## Backend Deployment on Render

### Prerequisites
- Render account (free tier available)
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- Gmail account with app password (for Nodemailer)
- Mistral AI account (for Bujji AI assistant)

### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Whitelist IP addresses (use 0.0.0.0/0 for Render)
5. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/agri-marketplace`

### Step 2: Set up Cloudinary
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Navigate to Dashboard
4. Copy your:
   - Cloud name
   - API Key
   - API Secret

### Step 3: Set up Gmail App Password (for Nodemailer)
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-factor authentication if not already enabled
3. Go to Security → App passwords
4. Select "Mail" and your device
5. Generate a new app password
6. Copy the 16-character password (use this in EMAIL_PASSWORD)

### Step 4: Set up Mistral AI (for Bujji AI Assistant)
1. Go to [Mistral AI Console](https://console.mistral.ai/)
2. Create a free account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the API key (use this in MISTRAL_API_KEY)

### Step 5: Deploy Backend on Render

#### 5.1 Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the `agri-marketplace` repository
5. Configure build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Runtime**: Node (latest)

#### 5.2 Add Environment Variables
Add these environment variables in Render:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/agri-marketplace
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
MISTRAL_API_KEY=your-mistral-api-key
NODE_ENV=production
PORT=5002
```

#### 5.3 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your Render backend URL (e.g., `https://your-backend.onrender.com`)

### Step 6: Update Frontend Configuration

Update `frontend/src/lib/axios.js` to use production URL:

```javascript
const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5002" 
  : "https://your-backend.onrender.com";
```

## Frontend Deployment on Vercel

### Prerequisites
- Vercel account (free)
- GitHub repository connected

### Step 1: Prepare Frontend for Production

1. Update `frontend/src/lib/axios.js` with your Render backend URL
2. Build the project locally to test:
   ```bash
   cd frontend
   npm run build
   ```

### Step 2: Deploy on Vercel

#### 2.1 Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository `agri-marketplace`

#### 2.2 Configure Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 2.3 Add Environment Variables (Optional)
If you need environment variables in frontend:
```
VITE_API_URL=https://your-backend.onrender.com
```

#### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your Vercel frontend URL

## Post-Deployment Configuration

### Update CORS Settings
Ensure your backend allows requests from your Vercel domain:

In `backend/src/server.js`, update CORS:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Test the Deployed Application
1. Visit your Vercel frontend URL
2. Test registration, login, and marketplace features
3. Verify image uploads to Cloudinary
4. Test email OTP functionality

## Troubleshooting

### Common Issues

**Backend not starting on Render:**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Frontend can't connect to backend:**
- Verify CORS settings in backend
- Check that backend URL is correct in frontend
- Ensure cookies are being sent (withCredentials: true)

**Images not uploading:**
- Verify Cloudinary credentials
- Check Cloudinary folder permissions
- Ensure file size limits are respected (5MB max)

**Email OTP not working:**
- Verify Gmail app password is correct
- Check 2-factor authentication is enabled
- Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE are correct
- Test email sending locally first

**AI Assistant not working:**
- Verify Mistral AI API key is set
- Check Mistral AI console for API usage
- Ensure the API key has sufficient credits
- Check backend logs for Mistral API errors

## Maintenance

### Updating the Application
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Render and Vercel will auto-deploy on push

### Monitoring
- **Render**: Check logs in Render dashboard
- **Vercel**: Check deployment logs in Vercel dashboard
- **MongoDB**: Monitor database usage in Atlas dashboard
- **Cloudinary**: Monitor storage usage in Cloudinary dashboard

## Cost Summary (Free Tiers)

- **Render**: Free web service (spins down after inactivity)
- **Vercel**: Free hosting with unlimited bandwidth
- **MongoDB Atlas**: 512MB storage (free tier)
- **Cloudinary**: 25GB storage/month (free tier)
- **Mistral AI**: Free tier with limited API calls

Total monthly cost: $0 (all free tiers)
