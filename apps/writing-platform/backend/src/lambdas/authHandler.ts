// authHandler.ts
import { AuthService } from '@services/authService';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
// import { errorHandler } from '../../../shared/backend/utils/errorHandler';

const authService = new AuthService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const result = await authService.authenticateUser(event);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        // return errorHandler(error);
        throw error;
    }
};
