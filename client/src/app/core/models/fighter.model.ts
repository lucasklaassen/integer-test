import { Base } from './base.model';

export class Fighter extends Base {
  id: number;
  winner: boolean;
  firstName: 'Glover';
  lastName: 'Teixeira';
  moneyline: number;
  preFightDraws: number;
  preFightLosses: number;
  preFightNoContests: number;
  preFightWins: number;

  constructor(args: Fighter) {
    super();
    Object.assign(this, args);
  }
}
