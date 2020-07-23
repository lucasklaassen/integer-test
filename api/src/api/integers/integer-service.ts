'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.tableName);

export class IntegerService {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getCurrent() {
    return Dynamo.get(String(this.userId), tableName);
  }

  async createDefault() {
    const data: any = {
      id: this.userId,
      integerValue: 1,
    };

    return Dynamo.write(data, tableName);
  }

  async increase() {
    const updateExpression = 'ADD #integerValue :incrementBy';
    const expressionAttributeValues = { ':incrementBy': 1 };
    const expressionAttributeNames = { '#integerValue': 'integerValue' };

    return Dynamo.update(this.userId, tableName, updateExpression, expressionAttributeValues, expressionAttributeNames);
  }

  async update(newIntegerValue: number) {
    const updateExpression = 'SET #integerValue = :newValue';
    const expressionAttributeValues = { ':newValue': newIntegerValue };
    const expressionAttributeNames = { '#integerValue': 'integerValue' };

    return Dynamo.update(this.userId, tableName, updateExpression, expressionAttributeValues, expressionAttributeNames);
  }
}
