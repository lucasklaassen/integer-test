'use strict';

import Dynamo from '../../common/dynamo';
const tableName = String(process.env.scheduledEventsTableName);
const middy = require('middy');
const got = require('got');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';
import { ScheduledEvent } from '../../interfaces/scheduled-event.interface';
import { ScheduledEventsService } from '../scheduled-events/scheduled-events-service';
import { Fight } from '../../interfaces/fight.interface';
import { FightsService } from '../fights/fights-service';

const fetchNewApiData = async () => {
  try {
    const response = await got(
      `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/${new Date().getFullYear()}?key=${process.env.API_KEY}`
    );
    const allEvents: ScheduledEvent[] = JSON.parse(response.body).map((apiEvent: any) =>
      ScheduledEventsService.mapKeys(apiEvent)
    );
    const upcomingEvents: ScheduledEvent[] = allEvents.filter(
      (event: ScheduledEvent) => new Date(event.dateTime) >= new Date()
    );

    for (let i = 0; i < upcomingEvents.length; i += 1) {
      const currentEvent: ScheduledEvent = upcomingEvents[i];

      try {
        console.log(upcomingEvents, currentEvent.id);
        const response = await got(
          `https://api.sportsdata.io/v3/mma/scores/json/Event/${currentEvent.id}?key=${process.env.API_KEY}`
        );

        const allFights: Fight[] = JSON.parse(response.body).Fights.map((apiFight: any) =>
          FightsService.mapKeys(apiFight)
        );

        currentEvent.fights = allFights;

        await Dynamo.write(currentEvent, tableName);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
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

const fetchNewApiDataHandler = middy(fetchNewApiData)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.fetchNewApiData = fetchNewApiDataHandler;
