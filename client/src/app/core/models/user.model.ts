import { Base } from './base.model';

export class User extends Base {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  constructor(args: User) {
    super();
    Object.assign(this, args);
  }

  public fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
