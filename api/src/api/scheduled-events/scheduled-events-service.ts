'use strict';

import Dynamo from '../../common/dynamo';
import { ScheduledEvent } from '../../interfaces/scheduled-event.interface';
const tableName = String(process.env.scheduledEventsTableName);

export class ScheduledEventsService {
  userId: string;
  eventId: number;

  constructor(userId: string, eventId: number) {
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

  static async getAll() {
    return Dynamo.getAll(tableName);
  }

  async fetch() {
    return Dynamo.get(+this.eventId, tableName);
  }

  async save(scheduledEvent: ScheduledEvent) {
    return Dynamo.write(scheduledEvent, tableName);
  }
}
