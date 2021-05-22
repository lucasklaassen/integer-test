import { Fight } from '../interfaces/fight.interface';
import { Fighter } from '../interfaces/fighter.interface';

export const hardcodedFighters = async (fight: Fight, fighterOverrides: any) => {
  const fightId = +fight.id;
  const fighterOverride = fighterOverrides[fightId];
  if (!fighterOverride) {
    return fight;
  }
  let newFighters: Fighter[] = [];
  fight.fighters.forEach((fighter) => {
    if (fighterOverride.includes(fighter.id)) {
      newFighters.push(fighter);
    }
  });
  fight.fighters = newFighters;
  return fight;
};
