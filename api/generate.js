const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { mode, input } = req.body;

        if (!input || !mode) {
            return res.status(400).json({ error: 'Missing mode or input' });
        }

        let prompt;
        if (mode === 'generate') {
            prompt = `Generate valid Kubernetes YAML for: ${input}`;
        } else {
            prompt = `Explain this Kubernetes YAML: ${input}`;
        }

        console.log('Calling Gemini API...');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        console.log('Gemini responded with status:', response.status);

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', error);
            return res.status(500).json({ error: 'Failed to generate response' });
        }

        const data = await response.json();
        let result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        result = result.replace(/```yaml\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('Success! Generated', result.length, 'characters');

        return res.status(200).json({
            result,
            usage: { remainingToday: 999, globalRemaining: 999 }
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message });
    }
};