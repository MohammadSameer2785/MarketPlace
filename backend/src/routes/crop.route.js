import express from "express";
import multer from "multer";
import path from "path";
import { body } from "express-validator";
import { getAllCrops, getTopDemandedCrops, addCrop, updateCrop, deleteCrop, getMyCrops } from "../controllers/crop.controller.js";
import { protectRoute, authorizeRoles } from "../middleware/auth.middleware.js";
import { storage } from "../config/cloudinary.js";

const router = express.Router();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
    }
  }
});

router.get('/', getAllCrops);
router.get('/top-demanded', getTopDemandedCrops);
router.post('/', protectRoute, authorizeRoles('farmer'), upload.single('image'), [
  body('name').notEmpty().withMessage('Crop name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('priceUnit').isIn(['kg', 'quintal']).withMessage('Invalid price unit'),
  body('quantityUnit').isIn(['kg', 'quintal']).withMessage('Invalid quantity unit'),
  body('category').isIn(['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'other']).withMessage('Invalid category')
], addCrop);
router.put('/:id', protectRoute, authorizeRoles('farmer'), upload.single('image'), updateCrop);
router.delete('/:id', protectRoute, authorizeRoles('farmer'), deleteCrop);
router.get('/my-crops', protectRoute, authorizeRoles('farmer'), getMyCrops);

export default router;
