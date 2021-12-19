import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import parser from 'lambda-multipart-parser';
import { v4 } from 'uuid';

import { UserProfile } from '../model/user-profile';
import { logger } from '../utils/logger';

AWS.config.update({ region: 'us-east-1' });

const uploadFile = async (file: parser.MultipartFile): Promise<string> => {
  const { filename, content, contentType } = file;

  logger.info({ filename, contentType });

  const s3 = new AWS.S3();

  const bucketName = process.env.BUCKET_NAME;

  await s3
    .putObject({
      Bucket: bucketName,
      Key: filename,
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
  const documentClient = new AWS.DynamoDB.DocumentClient();

  return documentClient
    .put({
      TableName: process.env.TABLE_NAME,
      Item: data,
    })
    .promise();
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

      return {
        statusCode: 400,
        body: 'Invalid multipart form',
      };
    }

    const [file] = files;

    const picture = await uploadFile(file);

    const { email, name } = fields;

    const user: UserProfile = {
      id: v4(),
      email,
      name,
      picture,
    };

    await saveUserProfile(user);

    await emitUserProfileCreatedEvent(user);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    logger.error({ error });

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
