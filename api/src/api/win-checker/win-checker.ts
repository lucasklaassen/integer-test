'use strict';

const middy = require('middy');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { Fight } from '../../interfaces/fight.interface';
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';
import { LeaderboardService } from '../leaderboard/leaderboard-service';
import { ScheduledEventsService } from '../scheduled-events/scheduled-events-service';
import { UserPicksService } from '../user-picks/user-picks-service';

const winChecker = async () => {
  // Loop through all user picks
  // for each array of picks, load up the scheduled events
  // cache scheduled events which have been seen before
  // If fight for pick has completed, mark pick as completed
  // If pick was correct, increment leaderpoint points

  const userPicks = await UserPicksService.scan();
  let scheduledEvents = {};

  for (let i = 0; i < userPicks.length; i += 1) {
    const currentPickObj = userPicks[i];
    const userEventId = currentPickObj.id;
    const lastIndex = userEventId.lastIndexOf('-');
    const userId = userEventId.substring(0, lastIndex);
    const eventId = userEventId.substring(lastIndex + 1);

    const userPicksService = new UserPicksService(userId, eventId);
    const leaderboardService = new LeaderboardService(userId);

    let scheduledEvent = scheduledEvents[eventId];

    if (!scheduledEvent) {
      let scheduledEventsService = new ScheduledEventsService(userId, eventId);
      scheduledEvent = await scheduledEventsService.fetch();
      scheduledEvents[eventId] = scheduledEvent;
    }

    for (let j = 0; j < currentPickObj.picks.length; j += 1) {
      const currentPick = currentPickObj.picks[j];
      if (currentPick.completed) {
        continue;
      }
      const currentFight: Fight = scheduledEvent.fights.find((fight: Fight) => +fight.id === +currentPick.fightId);
      if (currentFight.winnerId === null) {
        continue;
      }
      currentPick.correct = false;
      if (+currentFight.winnerId === +currentPick.fighterId) {
        await leaderboardService.increase();
        let oddsDifference = -Infinity;
        let underdogId;
        currentFight.fighters.forEach((fighter) => {
          const moneyline = +fighter.moneyline;
          if (fighter.moneyline > oddsDifference) {
            underdogId = fighter.id;
          }
          if (oddsDifference === -Infinity) {
            oddsDifference = Math.abs(moneyline);
          } else {
            oddsDifference += Math.abs(moneyline);
          }
        });
        if (oddsDifference >= 500 && +currentPick.fighterId === underdogId) {
          await leaderboardService.increase();
        }
        currentPick.correct = true;
      }
      currentPick.completed = true;
    }
    userPicksService.savePicks(currentPickObj.picks);
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

const winCheckerHandler = middy(winChecker)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.winChecker = winCheckerHandler;
