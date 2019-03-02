import { DataSeriesMapper } from '../../../../src/main/datastorage/DataSeriesMapper';
import { IStoreData } from '../../../../src/main/datastorage/IStoreData';
import { expect } from 'chai';
import { Entry } from '../../../../src/main/datastorage/Entry';

export function IStoreDataTestSuit(sharedData: SharedData) {
  describe('IStoreData', () => {
    it('Should be empty initially', done => {
      // FIXME: Values larger than 32bit ints not supported in LevelDataStore
      sharedData.putStore.get(-2147483648, 2147483647, (_, finished) => {
        expect(finished).to.be.true;
        done();
      });
    });

    it('Should have the same dataseriesmapper as it was created with', () => {
      expect(sharedData.getStore.getDataSeriesMapping()).is.deep.equal(sharedData.mapper);
    });

    describe('When putting entries', () => {
      it('Should contain all added entries with keys 5->10', done => {
        let entries = [
          new Entry(5, [0, 0, 0]), //
          new Entry(6, [1, 0, 0]),
          new Entry(7, [2, 0, 0]),
          new Entry(8, [3, 0, 0]),
          new Entry(9, [4, 0, 0]),
          new Entry(10, [5, 0, 0])
        ];

        sharedData.putStore.put(entries, () => {
          checkValues(sharedData.putStore, 5, 10, entries, done);
        });
      });

      it('Should throw an error if amount of values in an entry does not match amount of dataseries', () => {
        let entries = [
          new Entry(5, [0, 0, 1]), //
          new Entry(6, [1, 0])
        ];
        expect(() => {
          sharedData.putStore.put(entries);
        }).to.throw();
      });

      // FIXME: Negative values not supported in LevelDataStore
      // it('Should return all entries When entires with keys -3->2 are added', done => {
      //   let entries = [
      //     new Entry(-3, [0, 0, 0]), // Comment for preventing collapse
      //     new Entry(-2, [1, 0, 0]),
      //     new Entry(-1, [2, 0, 0]),
      //     new Entry(3, [3, 0, 0]),
      //     new Entry(2, [4, 0, 0]),
      //     new Entry(1, [5, 0, 0])
      //   ];

      //   sharedData.store.put(entries, () => {
      //     checkPut(sharedData.store, -3, 2, entries, done);
      //   });
      // });
    });

    describe('When getting entries', () => {
      let entries = [
        new Entry(1, [1.1, 1.2, 1.3]), //
        new Entry(2, [2.1, 2.2, 2.3]),
        new Entry(3, [3.1, 3.2, 3.3]),
        new Entry(4, [4.1, 4.2, 4.3]),
        new Entry(5, [5.1, 5.2, 5.3]),
        new Entry(6, [6.1, 6.2, 6.3]),
        new Entry(7, [7.1, 7.2, 7.3]),
        new Entry(8, [8.1, 8.2, 8.3]),
        new Entry(9, [9.1, 9.2, 9.3]),
        new Entry(10, [10.1, 10.2, 10.3])
      ];
      before(done => {
        sharedData.getStore.put(entries, () => {
          done();
        });
      });

      it('Should return 4 values when getting keys from 3 to 6, when all keys exist', done => {
        checkValues(sharedData.getStore, 3, 6, entries.slice(2, 6), done);
      });
      it('Should return 3 values when getting keys from 0 to 3, with key 0 not stored', done => {
        checkValues(sharedData.getStore, 0, 3, entries.slice(0, 3), done);
      });

      it('Should return 3 values when getting keys from 8 to 11, with key 11 not stored', done => {
        checkValues(sharedData.getStore, 0, 3, entries.slice(0, 3), done);
      });
      it('Should return 10 values when getting keys from 0 to 11, with keys 0 and 11 not stored', done => {
        checkValues(sharedData.getStore, 0, 11, entries, done);
      });
      it('Should return 0 values when getting keys from 11 to 100, when keys 11-100 does not exist', done => {
        checkValues(sharedData.getStore, 50, 100, [], done);
      });
      it('Should only return 2 dataseries when asking for 2, in the order asked', done => {
        let expected = entries.slice(2, 6);
        let indexofDS1 = sharedData.mapper.indexOf('dataseries1');
        let indexofDS2 = sharedData.mapper.indexOf('dataseries2');
        expected.forEach(e => {
          e.values = [e.values[indexofDS2!], e.values[indexofDS1!]];
        });

        checkValues(sharedData.getStore, 3, 6, expected, done, 'dataseries2', 'dataseries1');
      });
      it('Should throw an error when start is set to a larger value than end', () => {
        expect(() => {
          sharedData.getStore.get(20, 10, () => {});
        }).to.throw();
      });
    });
  });
}

function checkValues(store: IStoreData, start: number, end: number, expected: Array<Entry>, done: () => void, ...names: string[]) {
  let actual = new Array<Entry>();
  store.get(
    start,
    end,
    (data, finished) => {
      if (!finished) {
        expect(data).to.not.be.null;
        actual.push(data!);
      } else {
        expect(actual).to.deep.equal(expected);
        done();
      }
    },
    ...names
  );
}

export class SharedData {
  public putStore: IStoreData;
  public mapper: DataSeriesMapper;
  public getStore: IStoreData;

  constructor(putStore: IStoreData, getStore: IStoreData, mapper: DataSeriesMapper) {
    this.putStore = putStore;
    this.mapper = mapper;
    this.getStore = getStore;
  }
}
