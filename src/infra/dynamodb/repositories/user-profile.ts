import AWS from 'aws-sdk';

import { UserProfileRepository } from '../../../domain/contracts/user-profile-repository';
import { UserProfile } from '../../../domain/entities/user-profile';

export class DynamoDbUserProfileRepository implements UserProfileRepository {
  private documentClient: AWS.DynamoDB.DocumentClient;

  constructor(private readonly tableName: string) {
    this.documentClient = new AWS.DynamoDB.DocumentClient();
  }

  async findById(id: string): Promise<UserProfile | undefined> {
    const { Item } = await this.documentClient
      .get({
        TableName: this.tableName,
        Key: {
          id,
        },
      })
      .promise();

    return Item as UserProfile;
  }

  async save(data: UserProfile): Promise<void> {
    await this.documentClient
      .put({
        TableName: this.tableName,
        Item: data,
      })
      .promise();
  }
}
