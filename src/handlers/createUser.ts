import { APIGatewayProxyHandler } from 'aws-lambda';
import multipart from 'aws-lambda-multipart-parser';
import AWS from 'aws-sdk';

import { logger } from '../utils/logger';

AWS.config.update({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandler = async event => {
  try {
    if (event.isBase64Encoded) {
      // eslint-disable-next-line no-param-reassign
      event.body = Buffer.from(event.body, 'base64').toString('utf-8');
    }

    logger.info(typeof event.body);

    const { file } = multipart.parse(event, false);

    const { filename, content, contentType } = file;

    logger.info({ filename, contentType });
    logger.info({
      type: content.type,
      data: content.data,
      typeBuffer: typeof content,
    });

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

    const picture = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(
      filename,
    )}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        picture,
      }),
    };
  } catch (error) {
    logger.error({ error });

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
