import { Fighter } from './fighter.interface';

export interface Fight {
  id: number;
  cardSegment: string;
  order: number;
  referee: string;
  resultClock: number;
  resultRound: number;
  rounds: number;
  status: string;
  weightClass: string;
  winnerId: number | null;

  fighters: Fighter[];
}
