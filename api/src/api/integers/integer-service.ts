'use strict';

import { ApiEvent } from '../../interfaces/api.interface';
import Dynamo from '../../common/dynamo';
const tableName = String(process.env.tableName);

export class IntegerService {
  event: ApiEvent;

  constructor(event: ApiEvent) {
    this.event = event;
  }

  async create() {
    const data: any = {
      id: this.event.userId,
      integer: 1,
    };

    return Dynamo.write(data, tableName);
  }
}
