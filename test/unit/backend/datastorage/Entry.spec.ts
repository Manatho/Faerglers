import { Entry } from '../../../../src/main/datastorage/Entry';
import { expect } from 'chai';

describe('Entry', () => {
  describe('Constructor', () => {
    it('Should simply store the values given', () => {
      let entry = new Entry(1, [0,1,2,3,4]);
      expect(entry.timestamp).to.equal(1);
      expect(entry.values).to.include.members([0,1,2,3,4]);
    });
  });
});
