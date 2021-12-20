import { mock } from 'jest-mock-extended';

import { EventEmitter } from '../../../src/domain/contracts/event-emitter';
import { FileUpload } from '../../../src/domain/contracts/file-upload';
import { UserProfileRepository } from '../../../src/domain/contracts/user-profile-repository';
import { Uuid } from '../../../src/domain/contracts/uuid';
import { UserProfile } from '../../../src/domain/entities/user-profile';
import { EmailAlreadyExistsError } from '../../../src/domain/errors/email-already-exists';
import { CreateUserProfile } from '../../../src/domain/use-cases/create-user-profile';

describe('CreateUserProfile', () => {
  let uuid: jest.Mocked<Uuid>;
  let fileUpload: jest.Mocked<FileUpload>;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;
  let eventEmitter: jest.Mocked<EventEmitter<UserProfile>>;
  let params: any;
  let uuidValue: string;
  let picture: string;

  let sut: CreateUserProfile;

  beforeAll(() => {
    uuid = mock();
    fileUpload = mock();
    userProfileRepository = mock();
    eventEmitter = mock();

    uuidValue = 'any_uuid';
    picture = 'any_picture';

    uuid.generate.mockReturnValue(uuidValue);
    fileUpload.upload.mockResolvedValue(picture);
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

  it('should call UserProfileRepository findById with generate uuid', async () => {
    await sut.perform(params);

    expect(userProfileRepository.findById).toHaveBeenCalledWith(uuidValue);
    expect(userProfileRepository.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw if UserProfileRepository findById throw', async () => {
    userProfileRepository.findById.mockRejectedValueOnce(
      new Error('any_error'),
    );

    await expect(sut.perform(params)).rejects.toThrow();
  });

  it('should throw EmailAlreadyExistsError if UserProfileRepository findById returns', async () => {
    userProfileRepository.findById.mockResolvedValueOnce({} as any);

    await expect(sut.perform(params)).rejects.toBeInstanceOf(
      EmailAlreadyExistsError,
    );
  });

  it('should call FileUpload upload with correct params', async () => {
    await sut.perform(params);

    expect(fileUpload.upload).toHaveBeenCalledWith({
      id: uuidValue,
      file: params.file,
    });
    expect(fileUpload.upload).toHaveBeenCalledTimes(1);
  });

  it('should throw if FileUpload upload throws', async () => {
    fileUpload.upload.mockRejectedValueOnce(new Error('any_error'));

    await expect(sut.perform(params)).rejects.toThrow();
  });

  it('should call UserProfileRepository save with correct values', async () => {
    await sut.perform(params);

    expect(userProfileRepository.save).toHaveBeenCalledWith({
      id: uuidValue,
      email: params.email,
      name: params.name,
      picture,
    });
    expect(userProfileRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw if UserProfileRepository save throws', async () => {
    userProfileRepository.save.mockRejectedValueOnce(new Error('any_error'));

    await expect(sut.perform(params)).rejects.toThrow();
  });

  it('should call EventEmitter emit with correct values', async () => {
    await sut.perform(params);

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      id: uuidValue,
      email: params.email,
      name: params.name,
      picture,
    });
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
  });

  it('should throw if EventEmitter emit throws', async () => {
    eventEmitter.emit.mockRejectedValueOnce(new Error('any_error'));

    await expect(sut.perform(params)).rejects.toThrow();
  });

  it('should return user profile on success', async () => {
    const result = await sut.perform(params);

    expect(result).toMatchObject({
      id: uuidValue,
      email: params.email,
      name: params.name,
      picture,
    });
  });
});
