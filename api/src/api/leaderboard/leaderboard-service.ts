'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.leaderboardTableName);

export class LeaderboardService {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async fetch() {
    return Dynamo.get(this.userId, tableName);
  }

  async getAll() {
    return Dynamo.getAll(tableName);
  }

  async saveLeaderboard(name: string) {
    try {
      await Dynamo.get(this.userId, tableName);
      const updateExpression = 'SET #name = :newValue';
      const expressionAttributeValues = { ':newValue': name };
      const expressionAttributeNames = { '#name': 'name' };

      return Dynamo.update(
        this.userId,
        tableName,
        updateExpression,
        expressionAttributeValues,
        expressionAttributeNames
      );
    } catch (error) {
      const data: any = {
        id: this.userId,
        name,
      };

      return Dynamo.write(data, tableName);
    }
  }
}
