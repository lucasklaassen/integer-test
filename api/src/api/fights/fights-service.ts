'use strict';

import { FighterService } from "../fighter/fighter-service";

export class FightsService {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  static mapKeys(apiObject: any) {
    return {
      id: apiObject.FightId,
      cardSegment: apiObject.CardSegment,
      order: apiObject.Order,
      referee: apiObject.Referee,
      resultClock: apiObject.ResultClock,
      resultRound: apiObject.ResultRound,
      rounds: apiObject.Rounds,
      status: apiObject.Status,
      weightClass: apiObject.WeightClass,
      winnerId: apiObject.WinnerId,

      fighters: apiObject.Fighters.map((apiFighter: any) => FighterService.mapKeys(apiFighter)),
    };
  }
}