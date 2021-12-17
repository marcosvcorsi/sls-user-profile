import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import parser from 'lambda-multipart-parser';

import { logger } from '../utils/logger';

AWS.config.update({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandler = async event => {
  try {
    const { files } = await parser.parse(event);

    const [file] = files;

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

    const picture = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(
      filename,
    )}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ picture }),
    };
  } catch (error) {
    logger.error({ error });

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
