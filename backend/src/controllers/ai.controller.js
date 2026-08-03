import { getAIResponse, getFertilizerRecommendation } from "../services/aiService.js";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";

export const chatWithAI = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { message } = req.body;
  const userId = req.user?._id;

  try {
    // Get user role for context
    let userRole = 'consumer';
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        userRole = user.role;
      }
    }

    const aiResponse = await getAIResponse(message, userRole);
    
    res.json({
      success: true,
      response: aiResponse,
      assistantName: 'Bujji'
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get AI response'
    });
  }
};

export const getFertilizerAdvice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cropName, soilType, region } = req.body;

  try {
    const recommendation = await getFertilizerRecommendation(
      cropName,
      soilType || 'loamy',
      region || 'general'
    );
    
    res.json({
      success: true,
      recommendation,
      assistantName: 'Bujji'
    });
  } catch (error) {
    console.error('Fertilizer Advice Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get fertilizer recommendations'
    });
  }
};
