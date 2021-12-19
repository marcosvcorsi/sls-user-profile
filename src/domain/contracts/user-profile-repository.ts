import { UserProfile } from '../entities/user-profile';

export interface UserProfileRepository {
  findById(id: string): Promise<UserProfile | undefined>;
  save(data: UserProfile): Promise<void>;
}
