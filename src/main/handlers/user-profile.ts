import { APIGatewayProxyHandler } from 'aws-lambda';

import { logger } from '../utils/logger';

export const handler: APIGatewayProxyHandler = async event => {
  logger.info({ event });

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};
