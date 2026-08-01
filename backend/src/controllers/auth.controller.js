import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateAndSendOTP, verifyOTP, checkOTPRateLimit, updateOTPRateLimit } from "../services/otpService.js";
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

export const requestOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address' });
    }

    // Check rate limit
    if (!checkOTPRateLimit(email)) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    // Generate and send OTP
    const result = await generateAndSendOTP(email);
    updateOTPRateLimit(email);

    if (result.success) {
      res.json({ message: 'OTP sent to your email successfully' });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginWithOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, password } = req.body;

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

    // Verify OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ message: otpResult.message });
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
    console.error('Login with OTP error:', error);
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

export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address' });
    }

    // Send OTP to email
    const result = await generateAndSendOTP(email);
    
    if (result.success) {
      res.json({ message: 'OTP sent to your email address' });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ message: otpResult.message });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
