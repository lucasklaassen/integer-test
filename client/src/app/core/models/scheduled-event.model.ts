import { Base } from './base.model';
import { Fight } from './fight.model';

export class ScheduledEvent extends Base {
  id: number;
  leagueId: number;
  name: string;
  shortName: string;
  season: number;
  day: string;
  dateTime: string;
  status: string;
  active: boolean;
  fights: Fight[];

  constructor(args: ScheduledEvent) {
    super();
    Object.assign(this, args);
  }
}
