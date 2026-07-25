import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import cropRoutes from "./routes/crop.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Default UPI Configuration
app.get('/api/upi-config', (req, res) => {
  res.json({
    upiId: 'shivanakkanagoni17@okaxis',
    message: 'Default UPI ID for payments'
  });
});

// Production setup
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../../frontend/dist")));
//   app.get("*", (_, res) => {
//     res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
//   });
// }
app.get("/", (req, res) => {
    res.send("Backend is running...");
});
app.listen(PORT, () => {
  connectDB();
});
