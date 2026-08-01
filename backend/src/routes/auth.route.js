import express from "express";
import { signup, login, logout, loginWithOTP, requestOTP, checkAuth, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { body } from "express-validator";
import { protectRoute, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['farmer', 'consumer']).withMessage('Role must be farmer or consumer'),
  body('phone').notEmpty().withMessage('Phone number is required')
], signup);

// Request OTP
router.post('/request-otp', [
  body('email').isEmail().withMessage('Valid email is required')
], requestOTP);

// Login with OTP
router.post('/login-with-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('password').notEmpty().withMessage('Password is required')
], loginWithOTP);

// Login (traditional password only)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Logout
router.post('/logout', logout);

// Check auth (no protectRoute - allows checking auth status without being authenticated)
router.get('/check', checkAuth);

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], forgotPassword);

// Reset Password
router.post('/reset-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

export default router;
