import { S3FileStorage } from '../../../infra/s3/file-storage';

export const makeS3FileStorage = (): S3FileStorage =>
  new S3FileStorage(process.env.BUCKET_NAME);
