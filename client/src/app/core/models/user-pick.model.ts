import { Base } from './base.model';

export class UserPick extends Base {
  bigUnderdog: boolean;
  completed: boolean;
  correct: boolean;
  fightId: number;
  fighterId: number;

  constructor(args: UserPick) {
    super();
    Object.assign(this, args);
  }
}
