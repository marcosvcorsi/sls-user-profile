import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import parser from 'lambda-multipart-parser';
import { extname } from 'path';
import uuid from 'uuid-by-string';

import { UserProfile } from '../domain/entities/user-profile';
import { DynamoDbUserProfileRepository } from '../infra/dynamodb/repositories/user-profile';
import { badRequest, ok, serverError } from '../utils/http';
import { logger } from '../utils/logger';

AWS.config.update({ region: 'us-east-1' });

const userProfileRepository = new DynamoDbUserProfileRepository(
  process.env.TABLE_NAME,
);

const uploadFile = async (
  file: parser.MultipartFile,
  id: string,
): Promise<string> => {
  const { filename, content, contentType } = file;

  logger.info({ filename, contentType });

  const s3 = new AWS.S3();

  const bucketName = process.env.BUCKET_NAME;

  const extension = extname(filename);

  await s3
    .putObject({
      Bucket: bucketName,
      Key: `${id}${extension}`,
      Body: content,
      ContentType: contentType,
      ACL: 'public-read',
    })
    .promise();

  return `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(
    filename,
  )}`;
};

const saveUserProfile = async (data: UserProfile) => {
  return userProfileRepository.save(data);
};

const emitUserProfileCreatedEvent = async (
  user: UserProfile,
): Promise<void> => {
  const sns = new AWS.SNS();

  logger.info({ topic: process.env.SNS_USER_CREATED_TOPIC });

  await sns
    .publish({
      TopicArn: process.env.SNS_USER_CREATED_TOPIC,
      Message: JSON.stringify(user),
    })
    .promise();
};

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const { files, ...fields } = await parser.parse(event);

    if (!files?.length || !fields) {
      logger.warn('Invalid multipart form');

      return badRequest('Invalid multipart form');
    }

    const { email, name } = fields;

    const emailUuid = uuid(email);

    const emailAlreadyExists = await userProfileRepository.findById(emailUuid);

    if (emailAlreadyExists) {
      return badRequest('E-mail already exists');
    }

    const [file] = files;

    const picture = await uploadFile(file, emailUuid);

    const user: UserProfile = {
      id: emailUuid,
      email,
      name,
      picture,
    };

    await saveUserProfile(user);

    await emitUserProfileCreatedEvent(user);

    return ok(user);
  } catch (error) {
    logger.error({ error });

    return serverError();
  }
};
