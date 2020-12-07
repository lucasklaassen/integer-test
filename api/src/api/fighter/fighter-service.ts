'use strict';

export class FighterService {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  static mapKeys(apiObject: any) {
    return {
      id: apiObject.FighterId,
      winner: apiObject.Winner,
      firstName: apiObject.FirstName,
      lastName: apiObject.LastName,
      moneyline: apiObject.MoneyLine,
      preFightDraws: apiObject.PreFightDraws,
      preFightLosses: apiObject.PreFightLosses,
      preFightNoContests: apiObject.PreFightNoContests,
      preFightWins: apiObject.PreFightWins
    };
  }
}

