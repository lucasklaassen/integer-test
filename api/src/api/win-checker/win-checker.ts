'use strict';

const middy = require('middy');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { Fight } from '../../interfaces/fight.interface';
import { ScheduledEvent } from '../../interfaces/scheduled-event.interface';
import { hardcodedWins } from '../../lib/hardcoded-wins';
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';
import { HallOfFameService } from '../hall-of-fame/hall-of-fame-service';
import { LeaderboardService } from '../leaderboard/leaderboard-service';
import { ScheduledEventsService } from '../scheduled-events/scheduled-events-service';
import { UserPicksService } from '../user-picks/user-picks-service';
import { WinOverridesService } from '../win-overrides/win-overrides-service';

const winChecker = async () => {
  // Loop through all user picks
  // for each array of picks, load up the scheduled events
  // cache scheduled events which have been seen before
  // If fight for pick has completed, mark pick as completed
  // If pick was correct, increment leaderpoint points

  console.log('Running win checker');

  const userPicks = await UserPicksService.scan();
  const scheduledEvents: ScheduledEvent[] = await ScheduledEventsService.getAll();

  console.log('User Picks', JSON.stringify(userPicks));

  for (let i = 0; i < userPicks.length; i += 1) {
    const currentPickObj = userPicks[i];
    console.log('currentPickObj', JSON.stringify(currentPickObj));
    const userEventId = currentPickObj.id;
    const lastIndex = userEventId.lastIndexOf('-');
    const userId = userEventId.substring(0, lastIndex);
    const eventId = userEventId.substring(lastIndex + 1);

    console.log('userId', userId);
    console.log('eventId', eventId);

    const userPicksService = new UserPicksService(userId, eventId);
    const leaderboardService = new LeaderboardService(userId);

    let scheduledEvent: ScheduledEvent | undefined = scheduledEvents.find(
      (event: ScheduledEvent) => +event.id === +eventId
    );

    console.log('scheduledEvent', JSON.stringify(scheduledEvent));

    if (!scheduledEvent) {
      continue;
    }

    let winners = [];

    try {
      const winOverridesService = new WinOverridesService(+scheduledEvent.id);
      const winOverrides = await winOverridesService.fetch();

      winners = winOverrides.winners;
      console.log('winners', JSON.stringify(winners));
    } catch (error) {
      console.log(error);
    }

    for (let j = 0; j < currentPickObj.picks.length; j += 1) {
      const currentPick = currentPickObj.picks[j];
      console.log('currentUserPick', JSON.stringify(currentPick));
      if (currentPick.completed) {
        continue;
      }
      let currentFight: Fight | undefined = scheduledEvent.fights.find(
        (fight: Fight) => +fight.id === +currentPick.fightId
      );
      console.log('currentFight', JSON.stringify(currentFight));
      if (!currentFight) {
        continue;
      }

      currentFight = await hardcodedWins(currentFight, winners);

      if (currentFight.winnerId === null) {
        continue;
      }

      currentPick.correct = false;
      currentPick.bigUnderdog = false;
      console.log('Correct pick?', +currentFight.winnerId === +currentPick.fighterId);
      if (+currentFight.winnerId === +currentPick.fighterId) {
        console.log('increasing leaderboard point');
        await leaderboardService.increase();
        console.log('increasing leaderboard point complete');
        let oddsDifference = -Infinity;
        const fighter1 = currentFight.fighters[0];
        const fighter2 = currentFight.fighters[1];
        const underdogId = fighter1.moneyline > fighter2.moneyline ? fighter1.id : fighter2.id;
        console.log('underdogId', underdogId);
        currentFight.fighters.forEach((fighter) => {
          const moneyline = +fighter.moneyline;
          if (oddsDifference === -Infinity) {
            oddsDifference = Math.abs(moneyline);
          } else {
            oddsDifference += Math.abs(moneyline);
          }
        });
        console.log('oddsDifference', oddsDifference);
        if (oddsDifference >= 500) {
          currentPick.bigUnderdog = true;
          console.log('Big underdog!');
          if (+currentPick.fighterId === underdogId) {
            console.log('increasing leaderboard point for underdog');
            await leaderboardService.increase();
            console.log('increasing leaderboard point for underdog complete');
          }
        }
        console.log('Marking pick as correct!');
        currentPick.correct = true;
      }
      console.log('Marking pick as complete!');
      currentPick.completed = true;
    }
    console.log('save picks!');
    await userPicksService.savePicks(currentPickObj.picks);
    console.log('save picks complete');
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
        const name = leaderboard.name || 'Unknown';
        await hallOfFameService.saveHallOfFame(leaderboard.id, name);
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
        await hallOfFameService.increase(winner.id, winner.name || 'Unknown');
      }

      currentEvent.hallOfFameCounted = true;

      const scheduledEventsService = new ScheduledEventsService('', +currentEvent.id);
      await scheduledEventsService.save(currentEvent);

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
