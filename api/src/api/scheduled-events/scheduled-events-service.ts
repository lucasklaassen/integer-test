'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.scheduledEventsTableName);

export class ScheduledEventsService {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  static mapKeys(apiObject: any) {
    return {
      id: apiObject.EventId,
      leagueId: apiObject.LeagueId,
      name: apiObject.Name,
      shortName: apiObject.ShortName,
      season: apiObject.Season,
      day: apiObject.Day,
      dateTime: apiObject.DateTime,
      status: apiObject.Status,
      active: apiObject.Active
    };
  }

  async getAll() {
    return Dynamo.getAll(tableName);
  }
}
