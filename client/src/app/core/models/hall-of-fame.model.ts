import { Base } from './base.model';

export class HallOfFame extends Base {
  id: string;
  name: string;
  totalPoints: number;

  constructor(args: HallOfFame) {
    super();
    Object.assign(this, args);
  }
}
