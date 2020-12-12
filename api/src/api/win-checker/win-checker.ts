'use strict';

const middy = require('middy');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import Dynamo from '../../common/dynamo';
import { Fight } from '../../interfaces/fight.interface';
import { ScheduledEvent } from '../../interfaces/scheduled-event.interface';
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';
import { HallOfFameService } from '../hallOfFame/hall-of-fame-service';
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
  const scheduledEvents: ScheduledEvent[] = await ScheduledEventsService.getAll();

  for (let i = 0; i < userPicks.length; i += 1) {
    const currentPickObj = userPicks[i];
    const userEventId = currentPickObj.id;
    const lastIndex = userEventId.lastIndexOf('-');
    const userId = userEventId.substring(0, lastIndex);
    const eventId = userEventId.substring(lastIndex + 1);

    const userPicksService = new UserPicksService(userId, eventId);
    const leaderboardService = new LeaderboardService(userId);

    let scheduledEvent: ScheduledEvent | undefined = scheduledEvents.find(
      (event: ScheduledEvent) => +event.id === +eventId
    );

    for (let j = 0; j < currentPickObj.picks.length; j += 1) {
      const currentPick = currentPickObj.picks[j];
      if (currentPick.completed || !scheduledEvent) {
        continue;
      }
      const currentFight: Fight | undefined = scheduledEvent.fights.find(
        (fight: Fight) => +fight.id === +currentPick.fightId
      );
      if (!currentFight) {
        continue;
      }
      if (currentFight.winnerId === null) {
        continue;
      }
      currentPick.correct = false;
      currentPick.bigUnderdog = false;
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
          currentPick.bigUnderdog = true;
        }
        currentPick.correct = true;
      }
      currentPick.completed = true;
    }
    userPicksService.savePicks(currentPickObj.picks);
  }

  for (let i = 0; i < scheduledEvents.length; i += 1) {
    const currentEvent = scheduledEvents[i];
    const isPPV = currentEvent.name.match(/^UFC ([0-9]+).*$/);
    const leaderboardService = new LeaderboardService('');
    const leaderboards = await leaderboardService.getAll();
    const hallOfFameService = new HallOfFameService();

    if (isPPV && currentEvent.status === 'Final' && !currentEvent.hallOfFameCounted) {
      // Check leaderboard for top dawg, award one point,
      let winners: any[] = [];
      let max = -Infinity;

      for (let j = 0; j < leaderboards.length; j += 1) {
        const leaderboard = leaderboards[j];
        await hallOfFameService.saveHallOfFame(leaderboard.id, leaderboard.name);
        if (leaderboard.totalPoints >= max && leaderboard.totalPoints > 0) {
          if (leaderboard.totalPoints > max) {
            winners = [];
            max = leaderboard.totalPoints;
          }
          winners.push(leaderboard);
        }
      }

      console.log(JSON.stringify(winners));

      for (let j = 0; j < winners.length; j += 1) {
        const winner = winners[j];
        await hallOfFameService.increase(winner.id, winner.name);
      }

      currentEvent.hallOfFameCounted = true;
      const scheduledEventsTableName = String(process.env.scheduledEventsTableName);
      await Dynamo.write(currentEvent, scheduledEventsTableName);

      for (let j = 0; j < leaderboards.length; j += 1) {
        const leaderboard = leaderboards[j];
        const leaderboardService = new LeaderboardService(leaderboard.id);
        leaderboardService.reset();
      }
    }
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
