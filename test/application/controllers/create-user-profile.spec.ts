import { mock } from 'jest-mock-extended';

import { CreateUserProfileController } from '../../../src/application/controllers/create-user-profile';
import { EmailAlreadyExistsError } from '../../../src/domain/errors/email-already-exists';
import { CreateUserProfile } from '../../../src/domain/use-cases/create-user-profile';

describe('CreateUserProfileController', () => {
  let createUserProfile: jest.Mocked<CreateUserProfile>;
  let user: any;
  let httpRequest: any;

  let sut: CreateUserProfileController;

  beforeAll(() => {
    createUserProfile = mock();

    user = {
      id: 'any_id',
      email: 'any_mail@mail.com',
      name: 'any_name',
      picture: 'any_picture',
    };

    createUserProfile.perform.mockResolvedValue(user);
  });

  beforeEach(() => {
    httpRequest = {
      email: 'any_mail@mail.com',
      name: 'any_name',
      file: {
        filename: 'any_file.png',
        content: Buffer.from('any_buffer'),
        contentType: 'image/png',
      },
    };

    sut = new CreateUserProfileController(createUserProfile);
  });

  it('should call CreateUserProfile with correct params', async () => {
    await sut.handle(httpRequest);

    expect(createUserProfile.perform).toHaveBeenCalledWith(httpRequest);
    expect(createUserProfile.perform).toHaveBeenCalledTimes(1);
  });

  it('should return ok with user profile on success', async () => {
    const result = await sut.handle(httpRequest);

    expect(result).toEqual({
      statusCode: 200,
      body: user,
    });
  });

  it('should return badRequest when throw EmailAlreadyExistsError', async () => {
    const error = new EmailAlreadyExistsError();

    createUserProfile.perform.mockRejectedValueOnce(error);

    const result = await sut.handle(httpRequest);

    expect(result).toEqual({
      statusCode: 400,
      body: {
        message: error.message,
      },
    });
  });

  it('should return serverError when something wrong happened', async () => {
    const error = new Error('any_error');

    createUserProfile.perform.mockRejectedValueOnce(error);

    const result = await sut.handle(httpRequest);

    expect(result).toEqual({
      statusCode: 500,
      body: {
        message: expect.any(String),
      },
    });
  });
});
