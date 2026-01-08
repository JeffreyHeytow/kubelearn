const Redis = require('ioredis');

// Configuration
const REQUESTS_PER_IP_PER_DAY = 3;
const GLOBAL_DAILY_LIMIT = 100;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Create Redis client
const redis = new Redis(process.env.REDIS_URL);

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get client IP
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'unknown';
        const today = new Date().toISOString().split('T')[0];

        // Check global daily limit
        const globalKey = `global:${today}`;
        const globalCount = parseInt(await redis.get(globalKey) || '0');

        if (globalCount >= GLOBAL_DAILY_LIMIT) {
            return res.status(429).json({
                error: 'Daily limit reached. Please try again tomorrow.',
                type: 'global_limit'
            });
        }

        // Check IP-based limit
        const ipKey = `ip:${ip}:${today}`;
        const ipCount = parseInt(await redis.get(ipKey) || '0');

        if (ipCount >= REQUESTS_PER_IP_PER_DAY) {
            return res.status(429).json({
                error: `You've reached your limit of ${REQUESTS_PER_IP_PER_DAY} requests today. Try again tomorrow!`,
                type: 'ip_limit'
            });
        }

        // Get request body
        const { mode, input } = req.body;

        if (!input || !mode) {
            return res.status(400).json({ error: 'Missing mode or input' });
        }

        // Prepare prompt for Gemini
        let prompt;
        if (mode === 'generate') {
            prompt = `You are a Kubernetes YAML expert. Generate valid, production-ready Kubernetes YAML based on this description: "${input}"

Requirements:
- Output ONLY valid YAML code, no markdown formatting
- Include helpful comments explaining key sections
- Follow Kubernetes best practices
- Ensure proper indentation

Generate the YAML now:`;
        } else {
            prompt = `You are a Kubernetes expert. Explain this Kubernetes YAML in clear, educational terms:

${input}

Break down what each section does and why it matters. Be concise but thorough. Use clear formatting.`;
        }

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 2000,
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', error);
            return res.status(500).json({ error: 'Failed to generate response' });
        }

        const data = await response.json();

        // Extract text from Gemini response
        let result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

        // Clean up markdown formatting if present
        result = result.replace(/```yaml\n?/g, '').replace(/```\n?/g, '').trim();

        // Increment counters (with 24-hour expiry)
        await redis.setex(ipKey, 86400, (ipCount + 1).toString());
        await redis.setex(globalKey, 86400, (globalCount + 1).toString());

        // Return success with usage info
        const remainingRequests = REQUESTS_PER_IP_PER_DAY - (ipCount + 1);

        return res.status(200).json({
            result,
            usage: {
                remainingToday: Math.max(0, remainingRequests),
                globalRemaining: Math.max(0, GLOBAL_DAILY_LIMIT - (globalCount + 1))
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};