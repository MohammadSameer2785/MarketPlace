import express from "express";
import { signup, login, logout, checkAuth } from "../controllers/auth.controller.js";
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

// Login (traditional password only)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Logout
router.post('/logout', logout);

// Check auth (no protectRoute - allows checking auth status without being authenticated)
router.get('/check', checkAuth);

export default router;
