import { IStoreDataTestSuit, SharedData } from './IStoreData.Shared';
import { LevelDataStore } from '../../../../src/main/datastorage/LevelDataStore';
import { DataSeriesMapper } from '../../../../src/main/datastorage/DataSeriesMapper';
import { expect } from 'chai';

let mapper = new DataSeriesMapper(['dataseries1', 'dataseries2', 'dataseries3']);
let openCloseDb = new LevelDataStore('test/temp/opencloseleveldb', mapper);
let sharedObject = new SharedData(
  new LevelDataStore('test/temp/putleveldb', mapper), //
  new LevelDataStore('test/temp/getleveldb', mapper),
  mapper
);

describe('LevelDataStore of', () => {
  it('Should be able to open existing database', done => {
    openCloseDb.close(() => {
      openCloseDb = new LevelDataStore('test/temp/opencloseleveldb', mapper);
      done();
    });
  });

  it('Should throw an error if there is a mismatch between mappers when reopening', done => {
    openCloseDb.close(() => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression-chai
        new LevelDataStore('test/temp/opencloseleveldb', new DataSeriesMapper(['dataseries1']));
      }).to.throw();
      done();
    });
  });

  IStoreDataTestSuit(sharedObject);
});
