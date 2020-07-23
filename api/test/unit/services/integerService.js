/* eslint no-unused-expressions: 0 */
'use strict';

import Dynamo from '../../../src/common/dynamo';
import {
  IntegerService
} from '../../../src/api/integers/integer-service';

const chai = require('chai');
const expect = require('chai').expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Integer Service', () => {
  describe('getCurrent()', () => {
    before(async () => {
      sinon.stub(Dynamo, 'get').returns({
        Attributes: {
          integerValue: 1
        }
      });
    });

    it('gets the current integer', async () => {
      const integerService = new IntegerService('123');
      const response = await integerService.getCurrent();
      expect(response.Attributes.integerValue).to.eq(1);
    });
  });

  describe('createDefault()', () => {
    before(async () => {
      sinon.stub(Dynamo, 'write').returns({
        Attributes: {
          integerValue: 1
        }
      });
    });

    it('creates a default integer of 1 and returns it', async () => {
      const integerService = new IntegerService('123');
      const response = await integerService.createDefault();
      expect(response.Attributes.integerValue).to.eq(1);
    });
  });

  describe('increase()', () => {
    before(async () => {
      sinon.stub(Dynamo, 'update').returns({
        Attributes: {
          integerValue: 2
        }
      });
    });

    after(function () {
      Dynamo.update.restore();
    });

    it('increases the integer and returns it', async () => {
      const integerService = new IntegerService('123');
      const response = await integerService.increase();
      expect(response.Attributes.integerValue).to.eq(2);
    });
  });

  describe('update()', () => {
    before(async () => {
      sinon.stub(Dynamo, 'update').returns({
        Attributes: {
          integerValue: 2000
        }
      });
    });

    it('updates the integer and returns it', async () => {
      const integerService = new IntegerService('123');
      const response = await integerService.update(2000);
      expect(response.Attributes.integerValue).to.eq(2000);
    });
  });
});