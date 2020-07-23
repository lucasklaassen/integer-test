import { APIGatewayEvent, Context, ProxyCallback, ProxyResult } from 'aws-lambda'; // tslint:disable-line no-implicit-dependencies (Using only the type information from the @types package.)

export interface ApiEvent extends APIGatewayEvent {
  body: any;
  userId: string;
  queryStringParameters: any;
}

export type ApiCallback = ProxyCallback;
export type ApiContext = Context;
export type ApiHandler = (event: ApiEvent, context: Context, callback: ApiCallback) => void; // Same as ProxyHandler, but requires callback.
export type ApiResponse = ProxyResult;
