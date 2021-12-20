import { S3 } from 'aws-sdk';
import { mocked } from 'jest-mock';

import { S3FileStorage } from '../../../src/infra/s3/file-storage';

jest.mock('aws-sdk');

describe('S3FileStorage', () => {
  let bucketName: string;
  let params: any;

  let putObjectSpy: jest.Mock;
  let putObjectPromiseSpy: jest.Mock;

  let sut: S3FileStorage;

  beforeAll(() => {
    bucketName = 'any_bucket_name';

    putObjectPromiseSpy = jest.fn();

    putObjectSpy = jest.fn(() => ({
      promise: putObjectPromiseSpy,
    }));

    mocked(S3).mockImplementation(
      jest.fn().mockImplementation(() => ({
        putObject: putObjectSpy,
      })),
    );
  });

  beforeEach(() => {
    params = {
      id: 'any_id',
      file: {
        filename: 'any_filename.png',
        content: Buffer.from('any_buffer'),
        contentType: 'image/png',
      },
    };

    sut = new S3FileStorage(bucketName);
  });

  it('should call AWS S3 putObject with correct params', async () => {
    await sut.upload(params);

    expect(putObjectSpy).toHaveBeenCalledWith({
      Bucket: bucketName,
      Key: `${params.id}.png`,
      Body: params.file.content,
      ContentType: params.file.contentType,
      ACL: 'public-read',
    });
    expect(putObjectSpy).toHaveBeenCalledTimes(1);
    expect(putObjectPromiseSpy).toHaveBeenCalledTimes(1);
  });

  it('should throw if AWS S3 putObject throws', async () => {
    putObjectPromiseSpy.mockRejectedValueOnce(new Error('any_error'));

    await expect(sut.upload(params)).rejects.toThrow();
  });

  it('should return a object link on success', async () => {
    const result = await sut.upload(params);

    const key = encodeURIComponent(`${params.id}.png`);

    expect(result).toBe(`https://${bucketName}.s3.amazonaws.com/${key}`);
  });
});
