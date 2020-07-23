import { IApiMetaData } from './api-meta-data.interface';

export interface IApiResponse<T> {
  data: T;
  meta: IApiMetaData;
}
