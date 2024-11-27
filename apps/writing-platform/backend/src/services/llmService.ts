import { OpenAI } from 'openai';
import { createResponse, logger } from '@packages-utils';
import { z } from 'zod';

// Define types for the suggestion response
interface Suggestion {
  type: 'grammar' | 'word-choice' | 'style';
  message: string;
}

interface SuggestionResponse {
  suggestions: Suggestion[];
  correctedText: string;
}

// Zod schema for validation
const SuggestionSchema = z.object({
  type: z.enum(['grammar', 'word-choice', 'style']),
  message: z.string()
});

const SuggestionResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema),
  correctedText: z.string()
});

const SuggestionsArraySchema = z.array(SuggestionSchema);

export class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
      });
  }
  private createStructuredPrompt(text: string): string {
    return `Analyze the following text and provide specific improvements in three categories:
- Grammar (e.g., subject-verb agreement, punctuation, sentence structure)
- Word Choice (e.g., spelling, appropriate word usage, clarity)
- Style (e.g., punctuation, capitalization, consistency)

For each category, only provide suggestions if there are genuine improvements to be made. 
If there are no improvements needed in a category, provide an empty message.
Include the complete corrected text incorporating all suggestions.

Format your response as a JSON object with the following structure:
{
  "suggestions": [
    {
      "type": "grammar",
      "message": "explanation or empty string if no improvements needed"
    },
    {
      "type": "word-choice",
      "message": "explanation or empty string if no improvements needed"
    },
    {
      "type": "style",
      "message": "explanation or empty string if no improvements needed"
    }
  ],
  "correctedText": "the complete corrected text"
}

Text to analyze: "${text}"

Remember:
1. Only include genuine improvements
2. Leave message empty if no improvements are needed in that category
3. Ensure the corrected text incorporates all valid suggestions
4. Pay attention to basic writing rules like proper punctuation and sentence endings`;
  }

  private parseResponse(response: string): SuggestionResponse {
    try {
      // Remove any additional text/explanations and extract just the JSON object
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON object found in response');
      }

      const parsedJson = JSON.parse(jsonMatch[0]);
      
      // Validate the parsed JSON against our schema
      const validatedResponse = SuggestionResponseSchema.parse(parsedJson);
      
      // Filter out suggestions with empty messages
      const filteredSuggestions = validatedResponse.suggestions.filter(
        suggestion => suggestion.message.trim() !== ''
      );

      return {
        suggestions: filteredSuggestions,
        correctedText: validatedResponse.correctedText
      };
    } catch (error) {
      logger.error('Error parsing LLM response', error);
      throw new Error('Failed to parse suggestions response');
    }
  }



  async getSuggestions(text: string): Promise<SuggestionResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an advanced writing assistant that provides specific, actionable suggestions for improving text. 
                     You focus only on genuine improvements and never make unnecessary suggestions. 
                     You always verify basic writing rules like proper punctuation and sentence structure.
                     You always respond with valid JSON in the requested format.`
          },
          {
            role: "user",
            content: this.createStructuredPrompt(text)
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      console.log("completion openai")
      console.log(completion.choices[0].message?.content)

      const content = completion.choices[0].message?.content;
      

      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return this.parseResponse(content);

      // return completion.choices[0].message?.content || 'No suggestions available';
    } catch (error) {
      logger.error('Error getting LLM suggestions', error);
      throw new Error('Failed to get writing suggestions');
    }
  }


  // // Helper method to validate text positions
  // private validatePositions(suggestions: Suggestion[], text: string): Suggestion[] {
  //   return suggestions.filter(suggestion => {
  //     const isValid = suggestion.start >= 0 && 
  //                    suggestion.end <= text.length && 
  //                    suggestion.start < suggestion.end;
      
  //     if (!isValid) {
  //       logger.info('Invalid position in suggestion', suggestion);
  //     }
      
  //     return isValid;
  //   });
  // }
}
