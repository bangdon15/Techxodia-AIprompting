/**
 * Obelisk by TechXodia — Optional Live LLM Integration (OpenAI & Google Gemini)
 * TechXodia Showcase Edition
 */

export class LiveLLMConnector {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('obelisk_llm_config') || localStorage.getItem('nexus_llm_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      provider: 'simulated', // 'simulated' | 'openai' | 'gemini'
      apiKey: '',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      streamResponse: true
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('obelisk_llm_config', JSON.stringify(this.config));
    localStorage.setItem('nexus_llm_config', JSON.stringify(this.config));
  }

  isLiveMode() {
    return this.config.provider !== 'simulated' && Boolean(this.config.apiKey?.trim());
  }

  /**
   * Test API connectivity
   */
  async testConnection(provider, apiKey, model) {
    const key = apiKey || this.config.apiKey;
    const prov = provider || this.config.provider;
    const mod = model || this.config.model;

    if (!key) {
      throw new Error('API key is empty. Please enter a valid API key.');
    }

    if (prov === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI connection failed with HTTP ${response.status}`);
      }
      return { success: true, message: 'OpenAI API key validated successfully!' };
    } else if (prov === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini connection failed with HTTP ${response.status}`);
      }
      return { success: true, message: 'Google Gemini API key validated successfully!' };
    }

    return { success: true, message: 'Simulation engine active (No API key needed).' };
  }

  /**
   * Execute Live LLM Request with RAG Grounding Context
   */
  async generateLiveResponse(query, retrievedChunks, activeKbName, onToken) {
    if (!this.isLiveMode()) {
      throw new Error('Live mode is not configured.');
    }

    // Build Grounding System Prompt
    const contextPrompt = retrievedChunks.map((c, i) =>
      `[Source #${i + 1}: ${c.fileName} ${c.section} (Relevance: ${Math.round(c.score * 100)}%)]\n${c.text}`
    ).join('\n\n');

    const systemInstruction = `You are Obelisk by TechXodia — "All your knowledge, assembled."
You are an enterprise autonomous knowledge assistant developed by TechXodia AI Labs.
You are operating on the knowledge base: "${activeKbName}".
You must answer questions strictly based on the provided enterprise grounding context.
If the context does not contain sufficient information, state that clearly and suggest consulting a TechXodia enterprise solutions specialist.
Include citations in this format when referencing facts: [Source: filename §section - Match%].
Maintain a professional, polished, technical, and concise tone.`;

    if (this.config.provider === 'openai') {
      return await this.callOpenAI(query, contextPrompt, systemInstruction, onToken);
    } else if (this.config.provider === 'gemini') {
      return await this.callGemini(query, contextPrompt, systemInstruction, onToken);
    }
  }

  async callOpenAI(query, contextPrompt, systemInstruction, onToken) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        temperature: this.config.temperature ?? 0.3,
        messages: [
          { role: 'system', content: `${systemInstruction}\n\n=== RETRIEVED ENTERPRISE CONTEXT ===\n${contextPrompt}` },
          { role: 'user', content: query }
        ],
        stream: Boolean(onToken)
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI returned status ${response.status}`);
    }

    if (onToken && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              onToken(delta, fullText);
            }
          } catch (e) {
            // skip malformed stream chunks
          }
        }
      }
      return fullText;
    } else {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  async callGemini(query, contextPrompt, systemInstruction, onToken) {
    const model = this.config.model || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

    const promptText = `${systemInstruction}\n\n=== RETRIEVED ENTERPRISE CONTEXT ===\n${contextPrompt}\n\n=== USER QUESTION ===\n${query}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: this.config.temperature ?? 0.3
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (onToken) {
      // Simulate stream chunks for Gemini if non-streaming endpoint was used
      let current = '';
      const words = resultText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = (i === 0 ? '' : ' ') + words[i];
        current += word;
        onToken(word, current);
        await new Promise(r => setTimeout(r, 12));
      }
    }

    return resultText;
  }
}
