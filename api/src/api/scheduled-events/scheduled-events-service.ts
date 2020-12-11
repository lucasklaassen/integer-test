'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.scheduledEventsTableName);

export class ScheduledEventsService {
  userId: string;
  eventId: string;

  constructor(userId: string, eventId: string) {
    this.userId = userId;
    this.eventId = eventId;
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
      active: apiObject.Active,
    };
  }

  async getAll() {
    return Dynamo.getAll(tableName);
  }

  async fetch() {
    return Dynamo.get(+this.eventId, tableName);
  }
}
