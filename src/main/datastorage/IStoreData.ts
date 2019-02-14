import { Entry } from './Entry';
import { DataSeriesMapper } from './DataSeriesMapper';

export interface IStoreData {
  /**
   * Stores all entries specified
   * @param entries An a array of key-value pairs.
   */
  put(entries: Entry[], callback?: () => void): void;

  /**
   * Returns the entries in the specified range, containing the specified dataseries.
   * @param start Inclusive start unix timestamp of the range.
   * @param end Inclusive end unix timestamp of the range.
   * @param callback Use this to process the data, one entry is passed at a time.
   * @param dataseries specifies which and the order of the dataseries returned, if undefined all dataseries are returned in the order of the DataseriesMapper.
   */
  get(start: number, end: number, callback: (data: Entry | null, finished: boolean) => void, ...dataseries: string[]): void;

  /**
   * Returns the DataSeriesMapper used to create the DataStore.
   */
  getDataSeriesMapping(): DataSeriesMapper;

  /**
   * Close the datastore.
   * @param callback called when store has been closed.
   */
  close(callback: () => void): void;
}
