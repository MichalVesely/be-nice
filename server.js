const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');  // Add this line
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());  // Add this line
app.use(express.static('.'));
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

app.post('/translate', async (req, res) => {
    try {
        const { text, formal, mode } = req.body;

        let prompt;
        if (mode === 'nice') {
            prompt = `You are a polite translator. Your task is to translate the following ${formal ? 'formal' : 'informal'} text into a polite version while maintaining the original meaning:`;
        } else if (mode === 'mean') {
            prompt = "You are a mean translator. Your task is to translate the following text into a mean, edgy but slightly sarcastic and funny version while maintaining the original meaning:. Do not abuse race, gender, religion, or any other identity.";
        } else {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4",
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
        res.status(500).json({ error: 'An error occurred while processing' });
    }
});

app.use((req, res, next) => {
    console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).send('404 - Not Found');
});

app.get('/test', (req, res) => {
    res.send('Server is running');
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
