'use strict';

import { auth0Authorizer } from '../lib/auth0-authorizer';
import { ApiEvent, ApiContext, ApiCallback } from '../interfaces/api.interface';

const auth0AuthorizerEndpoint = async (event: ApiEvent, context: ApiContext, callback: ApiCallback) => {
  try {
    const result = await auth0Authorizer(event);
    return callback(null, result);
  } catch (error) {
    return context.fail('Unauthorized');
  }
};

const auth0AuthorizerHandler = auth0AuthorizerEndpoint;

module.exports.auth0Authorizer = auth0AuthorizerHandler;
