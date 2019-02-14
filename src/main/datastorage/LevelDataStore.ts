import { IStoreData } from './IStoreData';
import { DataSeriesMapper } from './DataSeriesMapper';
import { Entry } from './Entry';
import { AbstractBatch } from 'abstract-leveldown';
import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import encode from 'encoding-down';
import * as fs from 'fs';

export class LevelDataStore implements IStoreData {
  private db: LevelUp;
  private dsMapper: DataSeriesMapper;

  constructor(path: string, dataSeriesMapper: DataSeriesMapper) {
    this.dsMapper = dataSeriesMapper;

    // Checks whether dataseriesmapper is correct
    if (fs.existsSync(path)) {
      let dsmapper = fs.readFileSync(path + '/dataseriesMapper.json', 'utf8');
      if (dsmapper !== this.dsMapper.toJson()) {
        throw new Error(`dataseriesMapper mismatch!\nStored mapper was: ${dsmapper}, while: ${dataSeriesMapper.toJson()} was used\n`);
      }
    } else {
      fs.mkdirSync(path, { recursive: true });
      fs.writeFileSync(path + '/dataseriesMapper.json', dataSeriesMapper.toJson());
    }

    // Creates/opens database and sets encoders and decoders
    this.db = levelup(
      encode(leveldown(path), {
        keyEncoding: {
          buffer: true,
          type: 'number-encoder',
          encode: encodeInt,
          decode: decodeInt
        },
        valueEncoding: {
          buffer: true,
          type: 'numberarray-encoder',
          encode: encodeDoubleArray,
          decode: decodeDoubleArray
        }
      })
    );
  }

  /**
   * Stores all entries specified
   * @param entries An a array of key-value pairs.
   * @throws an error when the amount of values do not match the amount of dataseries
   */
  public put(entries: Entry[], callback?: () => void) {
    let ops: AbstractBatch[];
    ops = new Array();
    entries.forEach(entry => {
      if (entry.values.length !== this.dsMapper.names.length) throw new Error('Amount of values do not match with the amount of dataseries');
      ops.push({ type: 'put', key: entry.timestamp, value: entry.values });
    });
    this.db.batch(ops, callback);
  }

  // TODO: Throw expection when start is bigger than end
  /**
   * Returns the entries in the specified range, containing the specified dataseries.
   * @param start Inclusive start unix timestamp of the range.
   * @param end Inclusive end unix timestamp of the range.
   * @param callback Use this to process the data, one entry is passed at a time, last entry is null and 'finished' will be true.
   * @param dataseries specifies which and the order of the dataseries returned, if undefined all dataseries are returned in the order of the DataseriesMapper
   */
  public get(start: number, end: number, callback: (data: Entry | null, finished: boolean) => void, ...dataseries: string[]) {
    this.db
      .createReadStream({ gte: start, lte: end })
      .on('data', (data: { key: number; value: number[] }) => {
        if (dataseries.length !== 0) {
          callback({ timestamp: data.key, values: dataseries.map(name => this.dsMapper.indexOf(name)).map(i => data.value[i!]) }, false);
        } else {
          callback({ timestamp: data.key, values: data.value }, false);
        }
      })
      .on('close', () => {
        callback(null, true);
      });
  }

  /**
   * Returns the DataSeriesMapper used to create the DataStore
   */
  public getDataSeriesMapping(): DataSeriesMapper {
    return this.dsMapper;
  }

  /**
   * Close the datastore.
   * @param callback called when store has been closed.
   */
  public close(callback: () => void): void {
    this.db.close(callback);
  }
}

// -------------------------------------------
// -------Encoder/Decoder methods-------------
// -------------------------------------------

function encodeInt(n: number) {
  let buffer = Buffer.alloc(4);
  buffer.writeInt32BE(n, 0);
  return buffer;
}

function decodeInt(n: Buffer) {
  return n.readInt32BE(0);
}

function encodeDoubleArray(n: number[]) {
  let buffer = Buffer.alloc(8 * n.length);
  n.forEach((element, i) => {
    buffer.writeDoubleBE(element, i * 8);
  });
  return buffer;
}

function decodeDoubleArray(n: Buffer) {
  let doublearray = [];
  for (let i = 0; i < n.length / 8; i++) {
    doublearray.push(n.readDoubleBE(i * 8));
  }
  return doublearray;
}
