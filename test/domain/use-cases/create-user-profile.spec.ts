import { mock } from 'jest-mock-extended';

import { EventEmitter } from '../../../src/domain/contracts/event-emitter';
import { FileUpload } from '../../../src/domain/contracts/file-upload';
import { UserProfileRepository } from '../../../src/domain/contracts/user-profile-repository';
import { Uuid } from '../../../src/domain/contracts/uuid';
import { UserProfile } from '../../../src/domain/entities/user-profile';
import { CreateUserProfile } from '../../../src/domain/use-cases/create-user-profile';

describe('CreateUserProfile', () => {
  let uuid: jest.Mocked<Uuid>;
  let fileUpload: jest.Mocked<FileUpload>;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;
  let eventEmitter: jest.Mocked<EventEmitter<UserProfile>>;
  let params: any;

  let sut: CreateUserProfile;

  beforeAll(() => {
    uuid = mock();
    fileUpload = mock();
    userProfileRepository = mock();
    eventEmitter = mock();
  });

  beforeEach(() => {
    params = {
      email: 'any_mail@mail.com',
      name: 'any_name',
      file: {
        filename: 'any_file.png',
        content: Buffer.from('any_buffer'),
        contentType: 'image/png',
      },
    };

    sut = new CreateUserProfile(
      uuid,
      userProfileRepository,
      fileUpload,
      eventEmitter,
    );
  });

  it('should call Uuid generate with correct params', async () => {
    await sut.perform(params);

    expect(uuid.generate).toHaveBeenCalledWith(params.email);
    expect(uuid.generate).toHaveBeenCalledTimes(1);
  });

  it('should throw if Uuid generate throws', async () => {
    uuid.generate.mockImplementationOnce(() => {
      throw new Error('any_error');
    });

    await expect(sut.perform(params)).rejects.toThrow();
  });
});
