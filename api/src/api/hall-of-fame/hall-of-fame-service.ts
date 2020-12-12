'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.hallOfFameTableName);

export class HallOfFameService {
  constructor() {}

  async fetch(userId: string) {
    return Dynamo.get(userId, tableName);
  }

  async getAll() {
    return Dynamo.getAll(tableName);
  }

  async saveHallOfFame(userId: string, name: string) {
    try {
      await Dynamo.get(userId, tableName);
      const updateExpression = 'SET #name = :newValue';
      const expressionAttributeValues = { ':newValue': name };
      const expressionAttributeNames = { '#name': 'name' };

      return Dynamo.update(userId, tableName, updateExpression, expressionAttributeValues, expressionAttributeNames);
    } catch (error) {
      const data: any = {
        id: userId,
        name,
        totalPoints: 0,
      };

      return Dynamo.write(data, tableName);
    }
  }

  async increase(userId: string, name: string) {
    try {
      await Dynamo.get(userId, tableName);
      const updateExpression = 'ADD #totalPoints :incrementBy';
      const expressionAttributeValues = { ':incrementBy': 1 };
      const expressionAttributeNames = { '#totalPoints': 'totalPoints' };

      return Dynamo.update(userId, tableName, updateExpression, expressionAttributeValues, expressionAttributeNames);
    } catch (error) {
      const data: any = {
        id: userId,
        name,
        totalPoints: 1,
      };

      return Dynamo.write(data, tableName);
    }
  }
}
