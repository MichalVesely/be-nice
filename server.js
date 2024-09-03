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
    console.log('Received request to /translate');
    console.log('Request body:', req.body);
    try {
        const { text, formal } = req.body;

        if (!text || text.length > 1000) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        let prompt;
        if (formal) {
            prompt = "You are a communication expert specializing in rephrasing...";
        } else {
            prompt = "You are a communication expert adept at rephrasing...";
        }

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
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        res.status(500).json({ error: 'An error occurred while translating' });
    }
});

app.use((req, res, next) => {
    console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).send('404 - Not Found');
});

app.get('/test', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
