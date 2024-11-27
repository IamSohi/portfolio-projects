
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LLMService } from '@services/llmService';
import { createResponse, logger } from '@packages-utils';
import { AuthService } from '@services/authService';
const authService = new AuthService();

const llmService = new LLMService();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { Authorization } = event.headers || {};
    if (!Authorization) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - No token provided' }) };
    }
    console.log(Authorization)
 
    const token = Authorization.split(' ')[1]; // Get the token from the Authorization header
    const user = await authService.authenticateUser(event);
 
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - Invalid token' }) };
    }
 
    // If the token is valid, you can access the user information:
    const userId = user.sub; // or user.sub, depending on your JWT structure

    const body = JSON.parse(event.body || '{}');
    const { text } = body;
    console.log(text)
    if (!text) {
      return createResponse(400, { message: 'Text is required' });
    }

    const suggestions = await llmService.getSuggestions(text);
    console.log(suggestions)
    return createResponse(200, { suggestionData: suggestions });
  } catch (error) {
    logger.error('Error getting suggestions', error);
    return createResponse(500, { message: 'Error getting suggestions' });
  }
};

