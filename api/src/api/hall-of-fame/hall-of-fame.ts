'use strict';

const middy = require('middy');
const { httpHeaderNormalizer, doNotWaitForEmptyEventLoop, httpEventNormalizer } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors, userInfoToEvent } from '../../lib/middlewares';
import { ApiEvent } from '../../interfaces/api.interface';
import { HallOfFameService } from './hall-of-fame-service';

const getAll = async (event: ApiEvent) => {
  const hallOfFameService = new HallOfFameService();
  const hallOfFame = await hallOfFameService.getAll();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: hallOfFame,
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
