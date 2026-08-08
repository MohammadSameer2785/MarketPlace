import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";

export const signup = async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists. Please try a different email or login.' });
    }

    // Create new user with optional address
    const userData = {
      name,
      email,
      password,
      role,
      phone
    };

    // Only add address if it's provided and not empty
    if (address && (address.state || address.district || address.village || address.pincode)) {
      userData.address = {
        state: address.state || '',
        district: address.district || '',
        village: address.village || '',
        pincode: address.pincode || ''
      };
    }

    const user = new User(userData);
    const savedUser = await user.save();

    // Generate JWT token
    generateToken(savedUser._id, res);

    res.status(201).json({
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        phone: savedUser.phone,
        address: savedUser.address
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error from MongoDB
      return res.status(400).json({ message: 'User with this email already exists. Please try a different email or login.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    generateToken(user._id, res);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        upiId: user.upiId,
        upiQrCode: user.upiQrCode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(200).json(null);
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(200).json(null);
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      upiId: user.upiId,
      upiQrCode: user.upiQrCode
    });
  } catch (error) {
    res.status(200).json(null);
  }
};

