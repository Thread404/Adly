export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { prompt } = req.query;
  
  if (!prompt) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const newPrompt = `Caption for my image that is prompted using this prompt "${prompt}", give me the caption right away as a response 100 words with matching emojis related to the prompt, do not add any message not belonging to the caption just the plain caption itself`;
  const encodedPrompt = encodeURIComponent(newPrompt);
  const targetUrl = `https://text.pollinations.ai/${encodedPrompt}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }
    
    const caption = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    res.status(200).send(caption);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: error.message });
  }
}