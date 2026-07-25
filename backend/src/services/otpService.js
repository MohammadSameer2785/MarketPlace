import { Resend } from 'resend';
import crypto from 'crypto';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'AROVASTORE - Login OTP Verification',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a; font-size: 32px; margin: 0;">🌾 AROVASTORE</h1>
            <p style="color: #6b7280; margin: 5px 0;">Agricultural Marketplace</p>
          </div>
          
          <div style="background: #f0fdf4; border-radius: 12px; padding: 30px; text-align: center; border: 2px solid #16a34a;">
            <h2 style="color: #16a34a; margin: 0 0 10px 0;">Email Verification</h2>
            <p style="color: #374151; margin: 0 0 20px 0;">Your One-Time Password (OTP) for login is:</p>
            
            <div style="background: white; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #16a34a; letter-spacing: 8px;">${otp}</span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
              This OTP will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated message from AROVASTORE. Please do not reply to this email.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 AROVASTORE. All rights reserved.
            </p>
          </div>
        </div>
      `
    });

    return true;
  } catch (error) {
    throw new Error('Failed to send OTP email');
  }
};

// Store OTP with expiration
const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expiresAt, attempts: 0 });
  
  // Clean up expired OTPs periodically
  setTimeout(() => {
    if (otpStore.has(email) && otpStore.get(email).expiresAt <= Date.now()) {
      otpStore.delete(email);
    }
  }, 10 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (email, inputOTP) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (storedData.expiresAt <= Date.now()) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (storedData.attempts >= 3) {
    otpStore.delete(email);
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  if (storedData.otp !== inputOTP) {
    storedData.attempts++;
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }
  
  // OTP is valid, remove it from store
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully' };
};

// Generate and send OTP
const generateAndSendOTP = async (email) => {
  try {
    const otp = generateOTP();
    await sendOTPEmail(email, otp);
    storeOTP(email, otp);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error in generateAndSendOTP:', error);
    return { success: false, message: error.message };
  }
};

// Check if user has exceeded OTP request limit
const checkOTPRateLimit = (email) => {
  const storedData = otpStore.get(email);
  if (storedData && storedData.lastRequestTime) {
    const timeSinceLastRequest = Date.now() - storedData.lastRequestTime;
    if (timeSinceLastRequest < 60 * 1000) { // 1 minute cooldown
      return false;
    }
  }
  return true;
};

// Update last request time
const updateOTPRateLimit = (email) => {
  const storedData = otpStore.get(email);
  if (storedData) {
    storedData.lastRequestTime = Date.now();
  }
};

export {
  generateAndSendOTP,
  verifyOTP,
  checkOTPRateLimit,
  updateOTPRateLimit
};
