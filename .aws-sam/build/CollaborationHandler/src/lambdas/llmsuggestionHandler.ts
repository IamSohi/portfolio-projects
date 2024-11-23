
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LLMService } from '@services/llmService';
import { createResponse, logger } from '@packages-utils';
import { AuthService } from '@services/authService';
const authService = new AuthService();

const llmService = new LLMService();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { authorization } = event.headers || {};
    if (!authorization) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - No token provided' }) };
    }
 
    const token = authorization.split(' ')[1]; // Get the token from the Authorization header
    const user = await authService.authenticateUser(event);
 
    if (!user) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - Invalid token' }) };
    }
 
    // If the token is valid, you can access the user information:
    const userId = user.sub; // or user.sub, depending on your JWT structure

    const body = JSON.parse(event.body || '{}');
    const { text } = body;

    if (!text) {
      return createResponse(400, { message: 'Text is required' });
    }

    const suggestions = await llmService.getSuggestions(text);
    return createResponse(200, { suggestions });
  } catch (error) {
    logger.error('Error getting suggestions', error);
    return createResponse(500, { message: 'Error getting suggestions' });
  }
};

