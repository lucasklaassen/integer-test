'use strict';

const middy = require('middy');
const got = require('got');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';
import { ScheduledEvent } from '../../interfaces/scheduled-event.interface';
import { ScheduledEventsService } from '../scheduled-events/scheduled-events-service';
import { Fight } from '../../interfaces/fight.interface';
import { FightsService } from '../fights/fights-service';
import { hardcodedWins } from '../../lib/hardcoded-wins';
import { WinOverridesService } from '../win-overrides/win-overrides-service';
import { fighterOverrides } from './fighter-overrides';
import { hardcodedFighters } from '../../lib/hardcoded-fighters';

const yearToFetch = 2021;

const fetchNewApiData = async () => {
  try {
    const response = await got(
      `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/${yearToFetch}?key=${process.env.API_KEY}`
    );
    const allEvents: ScheduledEvent[] = JSON.parse(response.body).map((apiEvent: any) =>
      ScheduledEventsService.mapKeys(apiEvent)
    );
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const upcomingEvents: ScheduledEvent[] = allEvents.filter(
      (event: ScheduledEvent) => new Date(event.dateTime) >= yesterday
    );

    for (let i = 0; i < upcomingEvents.length; i += 1) {
      const currentEvent: ScheduledEvent = upcomingEvents[i];

      let winners = [];

      try {
        const winOverridesService = new WinOverridesService(+currentEvent.id);
        const winOverrides = await winOverridesService.fetch();

        winners = winOverrides.winners;
      } catch (error) {
        console.log(error);
      }

      try {
        console.log(upcomingEvents, currentEvent.id);
        const response = await got(
          `https://api.sportsdata.io/v3/mma/scores/json/Event/${currentEvent.id}?key=${process.env.API_KEY}`
        );

        const allFights: Fight[] = JSON.parse(response.body).Fights.map((apiFight: any) =>
          FightsService.mapKeys(apiFight)
        );

        let newFights: any = [];

        for (let j = 0; j < allFights.length; j += 1) {
          const currentFight = allFights[j];
          const currentFightResponse = await got(
            `https://api.sportsdata.io/v3/mma/stats/json/Fight/${currentFight.id}?key=${process.env.API_KEY}`
          );
          const newFight: Fight = FightsService.mapKeys(JSON.parse(currentFightResponse.body));
          if (newFight.fighters.length && newFight.status !== 'Canceled') {
            newFights.push(newFight);
          }
        }

        for (let k = 0; k < newFights.length; k += 1) {
          let fight: Fight = newFights[k];
          fight = await hardcodedFighters(fight, fighterOverrides);
          fight = await hardcodedWins(fight, winners);
          newFights[k] = fight;
        }

        currentEvent.fights = newFights;

        const scheduledEventsService = new ScheduledEventsService('', +currentEvent.id);
        await scheduledEventsService.save(currentEvent);
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
