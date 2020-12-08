import { Base } from './base.model';

export class Leaderboard extends Base {
  id: number;
  name: string;

  constructor(args: Leaderboard) {
    super();
    Object.assign(this, args);
  }
}
