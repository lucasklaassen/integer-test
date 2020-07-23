import { decodeToken } from './auth0-authorizer';

const Ajv = require('ajv');
const ajv = new Ajv();

export const httpJsonApiErrorHandler = () => ({
  onError: (handler: any, next: any) => {
    console.log('ERROR CAUGHT:', handler.error);
    const statusCode = handler.error.statusCode !== undefined ? handler.error.statusCode : 500;
    let errorMessage = handler.error.message;
    if (handler.error.message === 'Event object failed validation') {
      errorMessage = ajv.errorsText(handler.error.details);
    }
    handler.response = {
      statusCode,
      body: JSON.stringify({
        errorMessage,
      }),
    };
    return next();
  },
});

export const authenticateAndGetConnectionInfo = () => ({
  before: async (handler: any, next: any) => {
    handler.event.body = JSON.parse(handler.event.body);
    const { token } = handler.event.body || { token: '' };

    try {
      await decodeToken(token);
    } catch (error) {
      console.log(error);
      handler.response = {
        statusCode: 401,
        body: JSON.stringify({
          data: {
            message: 'User is not authenticated',
          },
        }),
      };
    }
  },
});

export const cors = () => ({
  after: (handler: any, next: any) => {
    handler.response = handler.response || {};
    handler.response.headers = handler.response.headers || {};

    handler.response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    handler.response.headers['Access-Control-Allow-Origin'] = '*';
    handler.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';

    return next();
  },
  onError: (handler: any, next: any) => {
    console.log('ERROR CAUGHT FROM CORS:', handler.error);
    handler.response = handler.response || {};
    handler.response.headers = handler.response.headers || {};

    handler.response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    handler.response.headers['Access-Control-Allow-Origin'] = '*';
    handler.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';

    return next();
  },
});
