import { APIGatewayProxyHandler } from 'aws-lambda';
import parser from 'lambda-multipart-parser';

import { badRequest, SERVER_ERROR } from '../../application/utils/http';
import { adaptHttpResponse } from '../adapters/http';
import { makeCreateUserProfileController } from '../factories/application/user-profile';
import { logger } from '../utils/logger';

export const handler: APIGatewayProxyHandler = async event => {
  const { files, ...fields } = await parser.parse(event);

  if (!files?.length || !fields) {
    logger.warn('Invalid multipart form');

    return badRequest('Invalid multipart form');
  }

  const { email, name } = fields;

  const [file] = files;

  const controller = makeCreateUserProfileController();

  const response = await controller.handle({
    email,
    name,
    file,
  });

  if (response.statusCode === SERVER_ERROR) {
    logger.error(response);
  }

  return adaptHttpResponse(response);
};
