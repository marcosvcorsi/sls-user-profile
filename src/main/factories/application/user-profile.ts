import { CreateUserProfileController } from '../../../application/controllers/create-user-profile';
import { makeCreateUserProfile } from '../domain/user-profile';

export const makeCreateUserProfileController =
  (): CreateUserProfileController => {
    return new CreateUserProfileController(makeCreateUserProfile());
  };
