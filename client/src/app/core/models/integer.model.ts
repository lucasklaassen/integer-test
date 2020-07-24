import { Base } from './base.model';

export class Integer extends Base {
  id: number;
  integer: number;

  constructor(args: Integer) {
    super();
    Object.assign(this, args);
  }
}
