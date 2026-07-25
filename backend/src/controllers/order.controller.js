import Order from "../models/Order.js";
import Crop from "../models/Crop.js";
import { body, validationResult } from "express-validator";

export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cropId, quantity, upiId } = req.body;

    const crop = await Crop.findById(cropId).populate('farmer', 'name email phone');
    if (!crop || !crop.isActive) {
      return res.status(404).json({ message: 'Crop not found or not available' });
    }

    if (quantity > crop.quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
    }

    let totalPrice = crop.price * quantity;
    
    if (crop.priceUnit === 'quintal' && crop.quantityUnit === 'kg') {
      totalPrice = (crop.price / 100) * quantity;
    } else if (crop.priceUnit === 'kg' && crop.quantityUnit === 'quintal') {
      totalPrice = crop.price * quantity * 100;
    }

    const order = new Order({
      buyer: req.user._id,
      farmer: crop.farmer._id,
      crop: crop._id,
      quantity,
      totalPrice,
      upiId
    });

    await order.save();

    crop.quantity -= quantity;
    crop.saleFrequency += 1;
    await crop.save();

    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'crop', select: 'name price priceUnit' }
    ]);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('farmer', 'name phone address')
      .populate('crop', 'name price priceUnit image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('buyer', 'name phone address')
      .populate('crop', 'name price priceUnit image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    if (status === 'completed') {
      order.completedAt = new Date();
    }

    await order.save();

    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'crop', select: 'name price priceUnit image' }
    ]);

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.paymentStatus = 'paid';
    order.paymentId = paymentId;
    order.status = 'confirmed';

    await order.save();

    order.receiptUrl = `/api/orders/${order._id}/receipt`;
    await order.save();

    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'crop', select: 'name price priceUnit image' }
    ]);

    res.json(order);
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone address')
      .populate('farmer', 'name email phone address')
      .populate('crop', 'name price priceUnit');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer._id.toString() !== req.user._id.toString() && 
        order.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }

    const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment Receipt - AgriMarketplace</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .content { margin: 20px 0; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🌾 AgriMarketplace Payment Receipt</h1>
        </div>
        <div class="content">
            <div class="field">
                <span class="label">Order ID:</span> ${order._id}
            </div>
            <div class="field">
                <span class="label">Date:</span> ${order.createdAt.toLocaleDateString()}
            </div>
            <div class="field">
                <span class="label">Status:</span> ${order.status.toUpperCase()}
            </div>
            <div class="field">
                <span class="label">Payment Status:</span> ${order.paymentStatus.toUpperCase()}
            </div>
            <hr>
            <h3>Crop Details</h3>
            <div class="field">
                <span class="label">Crop Name:</span> ${order.crop.name}
            </div>
            <div class="field">
                <span class="label">Quantity:</span> ${order.quantity} ${order.crop.priceUnit}
            </div>
            <div class="field">
                <span class="label">Price per ${order.crop.priceUnit}:</span> ₹${order.crop.price}
            </div>
            <div class="field">
                <span class="label">Total Price:</span> ₹${order.totalPrice}
            </div>
            <hr>
            <h3>Payment Details</h3>
            <div class="field">
                <span class="label">UPI ID:</span> ${order.upiId}
            </div>
            <div class="field">
                <span class="label">Payment ID:</span> ${order.paymentId}
            </div>
            <hr>
            <h3>Party Details</h3>
            <div class="field">
                <span class="label">Seller (Farmer):</span><br>
                Name: ${order.farmer.name}<br>
                Email: ${order.farmer.email}<br>
                Phone: ${order.farmer.phone}<br>
                Address: ${order.farmer.address?.village}, ${order.farmer.address?.district}, ${order.farmer.address?.state}
            </div>
            <div class="field">
                <span class="label">Buyer:</span><br>
                Name: ${order.buyer.name}<br>
                Email: ${order.buyer.email}<br>
                Phone: ${order.buyer.phone}<br>
                Address: ${order.buyer.address?.village}, ${order.buyer.address?.district}, ${order.buyer.address?.state}
            </div>
        </div>
        <div class="footer">
            <p>This is a digitally generated receipt. Thank you for using AgriMarketplace! 🌱</p>
        </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(receiptHtml);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
