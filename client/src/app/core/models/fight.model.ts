import { Base } from './base.model';
import { Fighter } from './fighter.model';

export class Fight extends Base {
  id: number;
  cardSegment: string;
  order: number;
  referee: string;
  resultClock: number;
  resultRound: number;
  rounds: number;
  status:
    | 'In Progress'
    | 'Final'
    | 'Scheduled'
    | 'End of Round'
    | 'Pre-fight'
    | 'Walkouts';
  weightClass: string;
  winnerId: number;

  fighters: Fighter[];

  constructor(args: Fight) {
    super();
    Object.assign(this, args);
  }
}
