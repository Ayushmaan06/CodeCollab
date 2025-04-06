import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    const endpointUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateText';
    
    const requestBody = {
      prompt: {
        text: prompt
      },

      temperature: 0.7,
      maxOutputTokens: 256,
      topP: 0.95,
      topK: 40
    };

    const apiResponse = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${geminiApiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await apiResponse.json();
    
    let reply;
    if (data.candidates && data.candidates.length > 0) {
      reply = data.candidates[0].output;
    } else {
      reply = 'No response generated.';
    }
    res.json({ reply });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ reply: 'Error processing the request' });
  }
});

export default router;