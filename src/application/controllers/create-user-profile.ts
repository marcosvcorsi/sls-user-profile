import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists';
import { CreateUserProfile } from '../../domain/use-cases/create-user-profile';
import { badRequest, HttpResponse, ok, serverError } from '../utils/http';

type HttpRequest = {
  email: string;
  name: string;
  file: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
};

export class CreateUserProfileController {
  constructor(private readonly createUserProfile: CreateUserProfile) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const user = await this.createUserProfile.perform(httpRequest);

      return ok(user);
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        return badRequest(error.message);
      }

      return serverError();
    }
  }
}
