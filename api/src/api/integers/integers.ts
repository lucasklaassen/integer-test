'use strict';
// TODO: is this needed?
export {};

const middy = require('middy');
const createError = require('http-errors');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';
import { ApiEvent } from '../../interfaces/api.interface';
import { IntegerService } from './integer-service';

const next = async (event: ApiEvent) => {
  const token = event.headers['Authorization'].split(' ')[1];
  const integerService = new IntegerService(event);

  await integerService.create();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        token,
      },
    }),
  };
};

const getNextHandler = middy(next)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.next = getNextHandler;

const current = async (event: ApiEvent) => {
  const token = event.headers['Authorization'].split(' ')[1];

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        token,
      },
    }),
  };
};

const getCurrentHandler = middy(current)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.current = getCurrentHandler;

const update = async (event: ApiEvent) => {
  const token = event.headers['Authorization'].split(' ')[1];

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        token,
      },
    }),
  };
};

const getUpdateHandler = middy(update)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.update = getUpdateHandler;
