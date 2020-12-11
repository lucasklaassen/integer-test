'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.userPicksTableName);

export class UserPicksService {
  userId: string;
  eventId: number;

  constructor(userId: string, eventId: number) {
    this.userId = userId;
    this.eventId = eventId;
  }

  static async scan() {
    return Dynamo.getAll(tableName);
  }

  async fetch() {
    console.log(this.userId, this.eventId);
    return Dynamo.get(this.id(), tableName);
  }

  async savePicks(picks: any) {
    // # TODO: add validation for picks
    // [{fightId: 123, fighterId: 1232131}]
    const data: any = {
      id: this.id(),
      picks,
    };

    return Dynamo.write(data, tableName);
  }

  id() {
    return `${String(this.userId)}-${String(this.eventId)}`;
  }
}
