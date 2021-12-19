import { EventEmitter } from '../contracts/event-emitter';
import { FileUpload } from '../contracts/file-upload';
import { UserProfileRepository } from '../contracts/user-profile-repository';
import { Uuid } from '../contracts/uuid';
import { UserProfile } from '../entities/user-profile';
import { EmailAlreadyExistsError } from '../errors/email-already-exists';

type Params = {
  file: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
  email: string;
  name: string;
};

type Result = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export class CreateUserProfile {
  constructor(
    private readonly uuid: Uuid,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly fileUpload: FileUpload,
    private readonly eventEmitter: EventEmitter<UserProfile>,
  ) {}

  async perform({ file, email, name }: Params): Promise<Result> {
    const id = this.uuid.generate(email);

    const emailAlreadyExists = await this.userProfileRepository.findById(id);

    if (emailAlreadyExists) {
      throw new EmailAlreadyExistsError();
    }

    const picture = await this.fileUpload.upload({
      id,
      file,
    });

    const user: UserProfile = {
      id,
      email,
      name,
      picture,
    };

    await this.userProfileRepository.save(user);

    await this.eventEmitter.emit(user);

    return user;
  }
}
