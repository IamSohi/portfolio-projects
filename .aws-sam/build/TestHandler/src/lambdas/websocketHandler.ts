
import { AuthService } from '@services/authService';
import { APIGatewayProxyHandler,APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentService } from '@services/docService';
import { createResponse, logger } from '@packages-utils';
const authService = new AuthService();

const docService = new DocumentService();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const { authorization } = event.headers || {};
    if (!authorization) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - No token provided' }) };
    }
 
    const token = authorization.split(' ')[1]; // Get the token from the Authorization header
    const user = await authService.authenticateUser(event);
 
    if (!user || !connectionId) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized - Invalid token' }) };
    }
 
    // If the token is valid, you can access the user information:
    const userId = user.sub; // or user.sub, depending on your JWT structure
    const body = JSON.parse(event.body || '{}');
    const { docId, action, data } = body;

    if (!docId || !action) {
      return createResponse(400, { message: 'Document ID and action are required' });
    }

    switch (action) {
      case 'join':
        // Here you would typically store the connection in a DynamoDB table
        logger.info('User joined document', { userId, docId, connectionId });
        return createResponse(200, { message: 'Joined document successfully' });

      case 'update':
        if (!data || !data.content) {
          return createResponse(400, { message: 'Content is required for updates' });
        }

        await docService.updateDocument(docId, userId, { content: data.content });
        // Here you would broadcast the change to other connected clients
        logger.info('Document updated', { docId, userId });
        return createResponse(200, { message: 'Update broadcast successfully' });

      default:
        return createResponse(400, { message: 'Invalid action' });
    }
  } catch (error) {
    logger.error('Error in collaboration handler', error);
    return createResponse(500, { message: 'Error processing collaboration request' });
  }
};
