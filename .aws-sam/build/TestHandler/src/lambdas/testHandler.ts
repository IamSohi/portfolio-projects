// import { AuthService } from '@services/authService';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
// import { errorHandler } from '../../../shared/backend/utils/errorHandler';
const fs = require('fs');
const path = require('path');

// const authService = new AuthService();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const nodeModulesPath = path.resolve('/opt/node_modules');
        const packages = fs.readdirSync(nodeModulesPath);
        return {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Packages in Lambda Layer',
              packages: packages
            }),
          };
        return {
            statusCode: 200,
            body: JSON.stringify("success"),
        };
    } catch (error) {
        // return errorHandler(error);
        throw error;
    }
};
