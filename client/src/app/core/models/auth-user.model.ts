import { Base } from './base.model';

export class AuthUser extends Base {
  userId: string;
  teamId: number;
  teamUserId: number;
  name: string;
  admin: boolean;

  constructor(args: AuthUser) {
    super();
    Object.assign(this, args);
  }
}
