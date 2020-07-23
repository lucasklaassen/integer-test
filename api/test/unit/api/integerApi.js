/* eslint no-unused-expressions: 0 */
'use strict';

import {
  getNumberOfDigits,
  validateInput
} from '../../../src/api/integers/integers';

const chai = require('chai');
const expect = require('chai').expect;
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Integer API', () => {
  describe('validateInput()', () => {
    it('validates that the body must contain a data payload.', async () => {
      expect(() => {
        validateInput({});
      }).to.throw('body.data must exist.');
    });

    it('validates that the data payload must contain an attributes payload.', async () => {
      expect(() => {
        validateInput({
          body: {
            data: {}
          }
        });
      }).to.throw('body.data.attributes must exist.');
    });

    it('validates that the attributes payload must contain an integerValue.', async () => {
      expect(() => {
        validateInput({
          body: {
            data: {
              attributes: {}
            }
          }
        });
      }).to.throw('body.data.attributes.integerValue must be a valid postive integer less than 38 digits.');
    });

    it('validates that the attributes payload must contain an integerValue.', async () => {
      expect(() => {
        validateInput({
          body: {
            data: {
              attributes: {}
            }
          }
        });
      }).to.throw('body.data.attributes.integerValue must be a valid postive integer less than 38 digits.');
    });

    it('validates that the attributes payload must contain valid integerValue.', async () => {
      expect(() => {
        validateInput({
          body: {
            data: {
              attributes: {
                integerValue: ''
              }
            }
          }
        });
      }).to.throw('body.data.attributes.integerValue must be a valid postive integer less than 38 digits.');
    });

    it('validates that the attributes payload must contain positive integerValue.', async () => {
      expect(() => {
        validateInput({
          body: {
            data: {
              attributes: {
                integerValue: -1000
              }
            }
          }
        });
      }).to.throw('body.data.attributes.integerValue must be a valid postive integer less than 38 digits.');
    });

    it('validates that the attributes payload contains a valid integerValue.', async () => {
      expect(() => {
        validateInput({
          body: {
            data: {
              attributes: {
                integerValue: 10
              }
            }
          }
        });
      }).to.not.throw('body.data.attributes.integerValue must be a valid postive integer less than 38 digits.');
    });
  });

  describe('getNumberOfDigits()', () => {
    it('returns the number of digits in a large number.', async () => {
      expect(getNumberOfDigits(1000000000)).to.eq(10);
    });
  });
});