const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/translate', async (req, res) => {
    try {
        const { text, formal } = req.body;

        if (!text || text.length > 1000) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const prompt = formal
            ? 'You are a communication expert specializing in rephrasing. Your task is to transform emotionally charged, angry, or impolite messages into calm, constructive, and professional communications - like talking to a colleague. Identify the core message and underlying concerns in the original text, then rephrase the content using neutral, respectful language while preserving the essential meaning. Remove any insults, profanity, or aggressive language, and structure the response to address the main points in a logical, clear manner. Maintain the original language of the input text. If the original message contains constructive criticism or valid complaints, preserve them in a more diplomatic tone. Aim for a tone that is calm, assertive (not aggressive) and solution-oriented. Keep length of response the same as length of input.'
            : 'You are a communication expert specializing in rephrasing. Your task is to transform emotionally charged, angry, or impolite messages into friendly, calm, constructive communications. – like talking to a good friend.  Identify the core message and underlying concerns in the original text, then rephrase the content using neutral, friendly language while preserving the essential meaning. Remove any insults, profanity, or aggressive language, and structure the response to address the main points in a logical, clear manner.  Maintain the original language of the input text. If the original message contains constructive criticism or valid complaints, preserve them in a more diplomatic tone. Aim for a tone that is calm, assertive (not aggressive), and solution-oriented. Keep length of response the same as length of input.';

        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: text }
                ],
                max_tokens: 150,
                n: 1,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const translatedText = openaiResponse.data.choices[0].message.content.trim();
        res.json({ translatedText });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while translating' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
