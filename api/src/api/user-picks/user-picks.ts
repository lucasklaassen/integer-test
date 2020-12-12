'use strict';

const middy = require('middy');
const {
  httpHeaderNormalizer,
  doNotWaitForEmptyEventLoop,
  httpEventNormalizer,
  jsonBodyParser,
} = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors, userInfoToEvent } from '../../lib/middlewares';
import { ApiEvent } from '../../interfaces/api.interface';
import { UserPicksService } from './user-picks-service';

const fetch = async (event: ApiEvent) => {
  const eventId = event.queryStringParameters.eventId;
  const userId = event.queryStringParameters.userId;
  const userPicksService = new UserPicksService(userId, eventId);
  const picks = await userPicksService.fetch();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: picks,
    }),
  };
};

const fetchHandler = middy(fetch)
  .use(userInfoToEvent())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.fetch = fetchHandler;

const savePicks = async (event: ApiEvent) => {
  const {
    userId,
    body: {
      data: { eventId, picks },
    },
  } = event;
  const userPicksService = new UserPicksService(userId, eventId);
  await userPicksService.savePicks(picks);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        success: true,
      },
    }),
  };
};

const savePicksHandler = middy(savePicks)
  .use(userInfoToEvent())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.savePicks = savePicksHandler;
