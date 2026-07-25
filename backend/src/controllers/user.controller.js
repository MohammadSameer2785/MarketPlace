import User from "../models/User.js";
import { body, validationResult } from "express-validator";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address, upiId } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (upiId) updates.upiId = upiId;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadUPIQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { upiQrCode: `/uploads/${req.file.filename}` },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Upload UPI QR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmers = async (req, res) => {
  try {
    const { state, district } = req.query;
    
    let query = { role: 'farmer' };
    
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (district) query['address.district'] = new RegExp(district, 'i');

    const farmers = await User.find(query)
      .select('name phone address upiId upiQrCode')
      .sort({ name: 1 });

    res.json(farmers);
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
