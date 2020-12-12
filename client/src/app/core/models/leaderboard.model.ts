import { Base } from './base.model';

export class Leaderboard extends Base {
  id: string;
  name: string;
  totalPoints: number;

  constructor(args: Leaderboard) {
    super();
    Object.assign(this, args);
  }
}
