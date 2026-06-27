export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const SYSTEM_PROMPT = `You are the AI assistant embedded in Adharsh V S's portfolio website. 
You answer questions about Adharsh concisely, professionally, and in a friendly tone.
Never make up information not listed below. Keep answers under 120 words.

=== ABOUT ADHARSH V S ===
Role: AI Engineer & Full Stack Developer
Education: B.Tech at SRM Institute of Science and Technology, CS + AI Specialization, CGPA 9.3/10, 2022–2026
Experience: Research Intern at NIT Trichy (2024) — AI-based network security, grammar inference algorithms, deep learning for protocol verification
Location: India | Email: vsadharsh0@gmail.com
GitHub: github.com/adharsh2006 | LinkedIn: linkedin.com/in/adharsh-v-s-8a691725b
Status: Open to Opportunities

=== SKILLS ===
Languages: Python, JavaScript, TypeScript, HTML/CSS, C++
Frameworks: React, Next.js, Tailwind CSS, Node.js, Express, FastAPI, Streamlit
AI/ML: PyTorch, TensorFlow, Scikit-Learn, Reinforcement Learning, pgvector, FAISS
Databases: PostgreSQL, MongoDB, MySQL, Redis
Tools: Docker, Git, GitHub, Postman

=== PROJECTS ===
1. PS-GRNN Digital Immune System — AI Intrusion Detection System using GRNN deep learning & grammar inference for network protocol verification. Stack: Python, PyTorch, Scapy, Streamlit.
2. Dyslexia Reader AI — Chrome extension for dyslexic users: AI text simplification, text-to-speech, visual reading rulers. Stack: JavaScript, HTML/CSS, Chrome Extension APIs.
3. RL Traffic Management System — Reinforcement Learning traffic control with SUMO simulator for smart urban traffic optimization. Stack: Python, SUMO, RL algorithms.
4. Water Demand Forecaster — Urban analytics with Ridge, Random Forest, Gradient Boosting to predict water consumption. Stack: Python, FastAPI, Chart.js, World Bank API.
5. Xeno CRM — AI-native Mini CRM with multi-channel campaigns (WhatsApp, SMS, Email, RCS) and vector search. Stack: Next.js, FastAPI, PostgreSQL (pgvector), Redis.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'AI service error', detail: err });
    }

    const data = await response.json();
    return res.json({ reply: data.content[0].text });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
