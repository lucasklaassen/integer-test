import { Fight } from './fight.interface';

export interface ScheduledEvent {
  id: number;
  leagueId: number;
  name: string;
  shortName: string;
  season: number;
  day: string;
  dateTime: string;
  status: string;
  active: boolean;
  hallOfFameCounted: boolean;
  fights: Fight[];
}
