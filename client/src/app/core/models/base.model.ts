export abstract class Base {
  errors?: Array<string>;

  constructor() {}

  json?<T>(): T {
    return JSON.parse(JSON.stringify(this));
  }
}
