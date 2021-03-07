import { Fight } from '../interfaces/fight.interface';

export const hardcodedWins = async (fight: Fight, winners: any) => {
  const fightId = +fight.id;
  fight.winnerId = null;

  winners.forEach((winner: any) => {
    if (+winner.fightId === +fightId) {
      fight.winnerId = +winner.winnerId;
      fight.status = 'Final';
    }
  });

  return fight;
};
