import { APIGatewayProxyResult } from 'aws-lambda';

export const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body)
  });
  