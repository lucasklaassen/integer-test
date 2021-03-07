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
import { WinOverridesService } from './win-overrides-service';
import { ScheduledEventsService } from '../scheduled-events/scheduled-events-service';
import { Fight } from '../../interfaces/fight.interface';

const fetch = async (event: ApiEvent) => {
  const id = +event.queryStringParameters.id;
  const winOverridesService = new WinOverridesService(id);
  const winners = await winOverridesService.fetch();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: winners,
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

const saveWinners = async (event: ApiEvent) => {
  const {
    body: {
      data: { id, winners },
    },
  } = event;
  const winOverridesService = new WinOverridesService(id);
  await winOverridesService.saveWinners(winners);

  const scheduledEventsService = new ScheduledEventsService('', id);
  const currentEvent = await scheduledEventsService.fetch();

  if (currentEvent && currentEvent.fights) {
    currentEvent.fights.forEach((fight: Fight) => {
      const winOverride = winners.find((winner: any) => +winner.fightId === +fight.id);
      if (winOverride) {
        fight.winnerId = winOverride.winnerId;
        fight.status = 'Final';
      }
    });

    await scheduledEventsService.save(currentEvent);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        success: true,
      },
    }),
  };
};

const saveWinnersHandler = middy(saveWinners)
  .use(userInfoToEvent())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.saveWinners = saveWinnersHandler;
