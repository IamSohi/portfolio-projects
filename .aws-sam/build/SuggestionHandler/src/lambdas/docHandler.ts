import { AuthService } from '@services/authService';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
// import { errorHandler } from '../../../shared/backend/utils/errorHandler';
import { DocumentService } from '@services/docService';
import { createResponse, logger } from '@packages-utils';

const authService = new AuthService();
const docService = new DocumentService();

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
   // ... other code ...
//    const session = event.headers.Authorization;

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

   // Now use userId to perform authorized operations (e.g., fetch user's documents)
   // ... your code to create, edit, or get documents (using userId for access control) ...

   switch (`${event.httpMethod} ${event.path}`) {
    case 'POST /documents':
      return await createDocument(event, userId);
    case 'GET /documents/{id}':
      return await getDocument(event, userId);
    default:
      return {
        statusCode: 404,
        body: 'Route not found',
      };
  }

};


const createDocument = async (event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> => {
  try {

    const body = JSON.parse(event.body || '{}');
    const document = await docService.createDocument({
      title: body.title,
      content: body.content,
      collaborators: body.collaborators,
      ownerId: userId
    });

    logger.info('Document created', { docId: document.id, userId });
    return createResponse(201, { document });
  } catch (error) {
    logger.error('Error creating document', error);
    return createResponse(500, { message: 'Error creating document' });
  }
};

const getDocument = async (event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> => {
  try {

    const docId = event.pathParameters?.id;
    if (!docId) {
      return createResponse(400, { message: 'Document ID is required' });
    }
    const document = await docService.getDocument(docId, userId);
    return createResponse(200, { document });
  } catch (error: any) {
    logger.error('Error getting document', error);
    if (error.message === 'Document not found') {
      return createResponse(404, { message: 'Document not found' });
    }
    return createResponse(500, { message: 'Error getting document' });
  }
};
