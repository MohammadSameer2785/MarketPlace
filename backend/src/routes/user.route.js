import express from "express";
import multer from "multer";
import path from "path";
import { body } from "express-validator";
import { getProfile, updateProfile, uploadUPIQR, getFarmers } from "../controllers/user.controller.js";
import { protectRoute, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'upi-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

router.get('/profile', protectRoute, getProfile);
router.put('/profile', protectRoute, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], updateProfile);
router.post('/upload-upi-qr', protectRoute, upload.single('qrCode'), uploadUPIQR);
router.get('/farmers', getFarmers);

export default router;
