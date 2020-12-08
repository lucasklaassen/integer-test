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
import { LeaderboardService } from './leaderboard-service';

const fetch = async (event: ApiEvent) => {
  const userId = event.userId;
  const leaderboardService = new LeaderboardService(userId);
  const leaderboard = await leaderboardService.fetch();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { name: leaderboard.name },
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

const getAll = async (event: ApiEvent) => {
  const userId = event.userId;
  const leaderboardService = new LeaderboardService(userId);
  const leaderboard = await leaderboardService.getAll();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: leaderboard,
    }),
  };
};

const getAllHandler = middy(getAll)
  .use(userInfoToEvent())
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.getAll = getAllHandler;

const saveLeaderboard = async (event: ApiEvent) => {
  const {
    userId,
    body: {
      data: { name },
    },
  } = event;
  const leaderboardService = new LeaderboardService(userId);
  await leaderboardService.saveLeaderboard(name);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        success: true,
      },
    }),
  };
};

const saveLeaderboardHandler = middy(saveLeaderboard)
  .use(userInfoToEvent())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.saveLeaderboard = saveLeaderboardHandler;
