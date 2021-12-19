import { UserProfile } from '../../../domain/entities/user-profile';
import { CreateUserProfile } from '../../../domain/use-cases/create-user-profile';
import { makeUserProfileRepository } from '../infra/repositories';
import { makeS3FileStorage } from '../infra/s3';
import { makeSNSEventEmitter } from '../infra/sns';
import { makeUuidHandler } from '../infra/uuid';

export const makeCreateUserProfile = (): CreateUserProfile => {
  return new CreateUserProfile(
    makeUuidHandler(),
    makeUserProfileRepository(),
    makeS3FileStorage(),
    makeSNSEventEmitter<UserProfile>(process.env.SNS_USER_CREATED_TOPIC),
  );
};
