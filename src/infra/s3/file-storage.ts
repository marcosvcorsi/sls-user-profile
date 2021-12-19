import AWS from 'aws-sdk';
import { extname } from 'path';

import { Params, FileUpload } from '../../domain/contracts/file-upload';

export class S3FileStorage implements FileUpload {
  private client: AWS.S3;

  constructor(private readonly bucketName: string) {
    this.client = new AWS.S3();
  }

  async upload({ id, file }: Params): Promise<string> {
    const { filename, content, contentType } = file;

    const extension = extname(filename);

    const key = `${id}${extension}`;

    await this.client
      .putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: content,
        ContentType: contentType,
        ACL: 'public-read',
      })
      .promise();

    return `https://${this.bucketName}.s3.amazonaws.com/${encodeURIComponent(
      key,
    )}`;
  }
}
