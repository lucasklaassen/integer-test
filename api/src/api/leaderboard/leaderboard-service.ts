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

  async reset() {
    try {
      await Dynamo.get(this.userId, tableName);
      const updateExpression = 'SET #totalPoints = :newValue';
      const expressionAttributeValues = { ':newValue': 0 };
      const expressionAttributeNames = { '#totalPoints': 'totalPoints' };

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
        totalPoints: 0,
      };

      return Dynamo.write(data, tableName);
    }
  }

  async increase() {
    try {
      await Dynamo.get(this.userId, tableName);
      const updateExpression = 'ADD #integerValue :incrementBy';
      const expressionAttributeValues = { ':incrementBy': 1 };
      const expressionAttributeNames = { '#integerValue': 'totalPoints' };

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
        totalPoints: 1,
      };

      return Dynamo.write(data, tableName);
    }
  }
}
