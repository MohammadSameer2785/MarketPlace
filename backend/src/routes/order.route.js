import express from "express";
import { body } from "express-validator";
import { createOrder, getMyOrders, getFarmerOrders, updateOrderStatus, confirmPayment, getReceipt } from "../controllers/order.controller.js";
import { protectRoute, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', protectRoute, authorizeRoles('consumer'), [
  body('cropId').notEmpty().withMessage('Crop ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('upiId').notEmpty().withMessage('UPI ID is required')
], createOrder);

router.get('/my-orders', protectRoute, authorizeRoles('consumer'), getMyOrders);
router.get('/farmer-orders', protectRoute, authorizeRoles('farmer'), getFarmerOrders);

router.put('/:id/status', protectRoute, authorizeRoles('farmer'), [
  body('status').isIn(['confirmed', 'completed', 'cancelled']).withMessage('Invalid status')
], updateOrderStatus);

router.put('/:id/payment', protectRoute, authorizeRoles('consumer'), [
  body('paymentId').notEmpty().withMessage('Payment ID is required')
], confirmPayment);

router.get('/:id/receipt', protectRoute, getReceipt);

export default router;
