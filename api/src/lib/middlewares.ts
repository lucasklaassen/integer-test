import { IntegerService } from '../api/integers/integer-service';

export const httpJsonApiErrorHandler = () => ({
  onError: (handler: any, next: any) => {
    console.log('ERROR CAUGHT:', handler.error);
    const statusCode = handler.error.statusCode !== undefined ? handler.error.statusCode : 500;
    let errorMessage = handler.error.message;
    handler.response = {
      statusCode,
      body: JSON.stringify({
        errors: [errorMessage],
      }),
    };
    return next();
  },
});

export const createIntegerIfNotExists = () => ({
  before: (handler: any, next: any) => {
    const integerService = new IntegerService(handler.event.userId);
    integerService
      .getCurrent()
      .then(() => {
        return next();
      })
      .catch((error) => {
        integerService.createDefault().then(() => {
          return next();
        });
      });
  },
});

export const userInfoToEvent = () => ({
  before: (handler: any, next: any) => {
    handler.event.userId = handler.event.requestContext.authorizer.userId;
    return next();
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
