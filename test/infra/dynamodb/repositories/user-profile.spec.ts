import AWS from 'aws-sdk';
import { mocked } from 'jest-mock';

import { UserProfile } from '../../../../src/domain/entities/user-profile';
import { DynamoDbUserProfileRepository } from '../../../../src/infra/dynamodb/repositories/user-profile';

jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(),
  },
}));

describe('DynamoDbUserProfileRepository', () => {
  let tableName: string;

  let sut: DynamoDbUserProfileRepository;

  beforeAll(() => {
    tableName = 'any_table_name';
  });

  beforeEach(() => {
    sut = new DynamoDbUserProfileRepository(tableName);
  });

  describe('findById', () => {
    let id: string;
    let item: any;

    let getSpy: jest.Mock;
    let getPromiseSpy: jest.Mock;

    beforeAll(() => {
      id = 'any_id';
      item = {
        any: 'value',
      };

      getPromiseSpy = jest.fn().mockResolvedValue({ Item: item });

      getSpy = jest.fn().mockReturnValue({
        promise: getPromiseSpy,
      });

      mocked(AWS.DynamoDB.DocumentClient).mockImplementation(
        jest.fn().mockImplementation(() => ({
          get: getSpy,
        })),
      );
    });

    it('should call DynamoDB DocumentClient get with correct values', async () => {
      await sut.findById(id);

      expect(getSpy).toHaveBeenCalledWith({
        TableName: tableName,
        Key: { id },
      });
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getPromiseSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw if DynamoDB DocumentClient get throws', async () => {
      getPromiseSpy.mockRejectedValueOnce(new Error('any_error'));

      await expect(sut.findById(id)).rejects.toThrow();
    });

    it('should return an item on success', async () => {
      const result = await sut.findById(id);

      expect(result).toEqual(item);
    });
  });

  describe('save', () => {
    let user: UserProfile;

    let putSpy: jest.Mock;
    let putPromiseSpy: jest.Mock;

    beforeAll(() => {
      putPromiseSpy = jest.fn();

      putSpy = jest.fn().mockReturnValue({
        promise: putPromiseSpy,
      });

      mocked(AWS.DynamoDB.DocumentClient).mockImplementation(
        jest.fn().mockImplementation(() => ({
          put: putSpy,
        })),
      );
    });

    beforeEach(() => {
      user = new UserProfile({
        id: 'any_id',
        email: 'any_mail@mail.com',
        name: 'any_name',
        picture: 'any_picture',
      });
    });

    it('should call DynamoDB DocumentClient put with correct values', async () => {
      await sut.save(user);

      expect(putSpy).toHaveBeenCalledWith({
        TableName: tableName,
        Item: user,
      });
      expect(putSpy).toHaveBeenCalledTimes(1);
      expect(putPromiseSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw if DynamoDB DocumentClient put throws', async () => {
      putPromiseSpy.mockRejectedValueOnce(new Error('any_error'));

      await expect(sut.save(user)).rejects.toThrow();
    });
  });
});
