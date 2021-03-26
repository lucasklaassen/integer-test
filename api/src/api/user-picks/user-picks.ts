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
import { ScheduledEventsService } from '../scheduled-events/scheduled-events-service';
import { Fight } from '../../interfaces/fight.interface';

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
  const scheduledEventsService = new ScheduledEventsService('', eventId);
  const currentEvent = await scheduledEventsService.fetch();

  try {
    const currentUserPicks = await userPicksService.fetch();
    currentUserPicks.picks.forEach((fight: any) => {
      const currentFightEvent: Fight = currentEvent.fights.find((eventFight: Fight) => eventFight.id === fight.fightId);
      const fightStarted = currentFightEvent.status !== 'Scheduled';
      if (fight.completed || fightStarted) {
        const indexAt = picks.findIndex((newFight: any) => fight.fightId === newFight.fightId);
        if (indexAt >= 0) {
          picks[indexAt] = fight;
        } else {
          delete picks[indexAt];
        }
      }
    });
  } catch (error) {
    picks.forEach((pick: any) => {
      const currentFightEvent: Fight = currentEvent.fights.find(
        (eventFight: Fight) => +eventFight.id === +pick.fightId
      );
      const fightStarted = currentFightEvent.status !== 'Scheduled';
      if (fightStarted) {
        pick.completed = true;
      }
    });
  }
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
