'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.winOverrideTableName);

export class WinOverridesService {
  id: number;

  constructor(id: number) {
    this.id = id;
  }

  static async scan() {
    return Dynamo.getAll(tableName);
  }

  async fetch() {
    return Dynamo.get(this.id, tableName);
  }

  async saveWinners(winners: any) {
    const data: any = {
      id: this.id,
      winners,
    };

    return Dynamo.write(data, tableName);
  }
}
