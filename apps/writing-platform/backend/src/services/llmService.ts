import { OpenAI } from 'openai';
import { createResponse, logger } from '@packages-utils';

export class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
      });
  }

  async getSuggestions(text: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful writing assistant. Provide brief, specific suggestions for improving the text."
          },
          {
            role: "user",
            content: `Please suggest improvements for this text: "${text}"`
          }
        ]
      });

      return completion.choices[0].message?.content || 'No suggestions available';
    } catch (error) {
      logger.error('Error getting LLM suggestions', error);
      throw new Error('Failed to get writing suggestions');
    }
  }
}