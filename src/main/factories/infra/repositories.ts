import { UserProfileRepository } from '../../../domain/contracts/user-profile-repository';
import { DynamoDbUserProfileRepository } from '../../../infra/dynamodb/repositories/user-profile';

export const makeUserProfileRepository = (): UserProfileRepository =>
  new DynamoDbUserProfileRepository(process.env.TABLE_NAME);
