'use strict';

const middy = require('middy');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors, userInfoToEvent } from '../../lib/middlewares';
import { ApiEvent } from '../../interfaces/api.interface';
import { ScheduledEvent } from '../../interfaces/scheduled-event.interface';
import { ScheduledEventsService } from './scheduled-events-service';

const getAll = async (event: ApiEvent) => {
  const events: ScheduledEvent[] = await ScheduledEventsService.getAll();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: events,
    }),
  };
};

const getAllHandler = middy(getAll)
  .use(userInfoToEvent())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.getAll = getAllHandler;