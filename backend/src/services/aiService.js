import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

const SYSTEM_PROMPT = `You are Bujji, an AI agricultural assistant for AROVASTORE - an agricultural marketplace platform. You help farmers and consumers with agricultural queries.

Your expertise includes:
- Crop cultivation advice (best practices, seasons, soil requirements)
- Fertilizer recommendations for specific crops
- Pest and disease management
- Irrigation techniques
- Market price trends and insights
- Organic farming practices
- Sustainable agriculture methods

Guidelines:
- Provide practical, actionable advice
- Consider local context when possible (mention regional variations)
- Suggest eco-friendly alternatives when appropriate
- Be concise but thorough
- If uncertain, suggest consulting local agricultural experts
- Always prioritize safety and environmental sustainability

Your tone should be:
- Friendly and approachable (like a knowledgeable farming neighbor)
- Encouraging and supportive
- Clear and easy to understand
- Professional but not overly academic`;

export const getAIResponse = async (userMessage, userRole = 'farmer') => {
  try {
    const roleContext = userRole === 'farmer' 
      ? 'The user is a farmer looking for practical farming advice.'
      : 'The user is a consumer/buyer interested in agricultural products and farming practices.';

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `${roleContext}\n\nUser query: ${userMessage}`
        }
      ],
      temperature: 0.7,
      maxTokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Mistral AI Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
};

export const getFertilizerRecommendation = async (cropName, soilType = 'loamy', region = 'general') => {
  try {
    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Provide fertilizer recommendations for ${cropName} crop. Soil type: ${soilType}, Region: ${region}. Include:
1. Primary fertilizers (NPK ratios)
2. Application timing and methods
3. Organic alternatives
4. Quantity guidelines
5. Precautions to avoid over-fertilization`
        }
      ],
      temperature: 0.6,
      maxTokens: 400
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Mistral AI Error:', error);
    throw new Error('Failed to get fertilizer recommendations. Please try again.');
  }
};
