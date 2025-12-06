class OpenAI {
  baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL;
    
    if (!this.baseURL) {
      console.error("⚠️ CLOUDFLARE_WORKER_URL is missing");
    }
  }

  chat = {
    completions: {
      create: async (params) => {
        return this._sendRequest("/chat", params);
      },
    },
  };

  responses = {
    create: async (params) => {
      return this.chat.completions.create(params);
    },
  };

  audio = {
    speech: {
      create: async (params, options) => {
        return this._sendRequest("/tts", params, options?.signal, true);
      },
    },
  };

  async _sendRequest(endpoint, body, signal = null, isBinary = false) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
        signal: signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Worker Error (${response.status}): ${errorText}`);
      }

      if (isBinary) {
        return response;
      }

      return await response.json();
    } catch (error) {
      console.error(`OpenAI Proxy Error [${endpoint}]:`, error);
      throw error;
    }
  }
}

export const openaiClient = new OpenAI();
