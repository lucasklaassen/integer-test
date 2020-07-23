'use strict';
// TODO: is this needed?
export {};

const middy = require('middy');
const createError = require('http-errors');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors, userInfoToEvent, createIntegerIfNotExists } from '../../lib/middlewares';
import { ApiEvent } from '../../interfaces/api.interface';
import { IntegerService } from './integer-service';
import { Integer } from '../../interfaces/integer.interface';

const next = async (event: ApiEvent) => {
  const integerService = new IntegerService(event.userId);
  const integerObj: Integer = await integerService.increase();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        integer: integerObj.integerValue,
      },
    }),
  };
};

const getNextHandler = middy(next)
  .use(userInfoToEvent())
  .use(createIntegerIfNotExists())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.next = getNextHandler;

const current = async (event: ApiEvent) => {
  const userId = event.userId;
  const integerService = new IntegerService(userId);
  const integerObj: Integer = await integerService.getCurrent();

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        integer: integerObj.integerValue,
      },
    }),
  };
};

const getCurrentHandler = middy(current)
  .use(userInfoToEvent())
  .use(createIntegerIfNotExists())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.current = getCurrentHandler;

const update = async (event: ApiEvent) => {
  await validateInput(event);

  const {
    userId,
    body: {
      data: {
        attributes: { integerValue },
      },
    },
  } = event;
  const integerService = new IntegerService(userId);
  const integerObj: Integer = await integerService.update(integerValue);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        integer: integerObj.integerValue,
      },
    }),
  };
};

const getUpdateHandler = middy(update)
  .use(userInfoToEvent())
  .use(createIntegerIfNotExists())
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.update = getUpdateHandler;

const validateInput = async (event: ApiEvent) => {
  if (event && event.body && event.body.data) {
    const { attributes } = event.body.data;
    if (!attributes) {
      throw new createError.BadRequest('body.data.attributes must exist.');
    }
    const integerValue = attributes.integerValue;
    if (!integerValue || isNaN(Number(integerValue)) || integerValue <= 0 || getNumberOfDigits(integerValue) >= 38) {
      throw new createError.BadRequest(
        'body.data.attributes.integerValue must be a valid postive integer less than 38 digits.'
      );
    }
  } else {
    throw new createError.BadRequest('body.data must exist.');
  }
};

const getNumberOfDigits = (integerValue: number) => {
  return Math.ceil(Math.log10(integerValue + 1));
};
