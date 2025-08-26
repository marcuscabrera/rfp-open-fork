import { AIServiceError } from '@/lib/errors/api-errors';

export class LocalLLMClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434/api/generate') {
    this.baseUrl = baseUrl;
  }

  async generate(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIServiceError(`Local LLM API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Failed to connect to local LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const localLLMClient = new LocalLLMClient();
