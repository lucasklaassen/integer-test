import { Fight } from '../interfaces/fight.interface';

export const hardcodedWins = (fight: Fight) => {
  const fightId = +fight.id;

  switch (fightId) {
    case 1890:
      fight.winnerId = 140000898;
      break;
    case 1916:
      fight.winnerId = 140001097;
      break;
    case 1918:
      fight.winnerId = 140000411;
      break;
    case 1919:
      fight.winnerId = 140000417;
      break;
    case 1920:
      fight.winnerId = 140000591;
      break;
    case 1921:
      fight.winnerId = 140000652;
      break;
    case 1894:
      fight.winnerId = 140000267;
      break;
    default:
  }

  return fight;
};
