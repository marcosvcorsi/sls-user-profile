export class UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;

  constructor(attrs: Partial<UserProfile>) {
    Object.assign(this, attrs);
  }
}
