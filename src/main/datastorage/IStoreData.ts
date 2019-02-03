export interface IStoreData {
  /**
   * Stores the specified entry in the datastore
   * @param timestamp Unix timestamp in seconds
   * @param values Array of doubles, each index corrosponding to a specific dataseries
   * the mapping of indexes to dataseries is not handled.
   */
  put(timestamp: number, values: number[]): void;

  /**
   * Stores all entries specified
   * @param entries An a array of key-value pairs.
   */
  putAll(entries: Entry[]): void;

  /**
   * Returns the entries in the specified range, containing the specified dataseries.
   * @param start Inclusive start unix timestamp of the range.
   * @param end Inclusive end unix timestamp of the range.
   * @param callback Use this to process the data, one entry is passed at a time.
   * @param dataseries specifies which and the order of the dataseries returned, if undefined all dataseries are returned in the order of the DataseriesMapper.
   */
  get(start: number, end: number, callback: (data: Entry, finished: boolean) => void, ...dataseries: string[]): void;

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

export class DataSeriesMapper {
  private _mapping: Map<string, number>;
  public readonly names: string[];

  constructor(dataseriesNames: string[]) {
    this._mapping = new Map();
    dataseriesNames.forEach((name, i) => {
      this._mapping.set(name, i);
    });

    this.names = [...this._mapping.keys()];
  }

  /**
   * Gets the index associated with the dataseries
   * @param dataseriesName name of the dataseries to get index of
   */
  public indexOf(dataseriesName: string) {
    return this._mapping.get(dataseriesName);
  }

  /**
   * Converts the object to json, use the static method 'fromJson' to convert it back to an object
   */
  public toJson(): string {
    return JSON.stringify([...this._mapping]);
  }

  /**
   * Returns a new DataSeriesMapper based on the json supplied.
   * @param json the json generated from calling 'toJson' on an DataSeriesMapper
   */
  public static fromJson(json: string): DataSeriesMapper {
    let temp = new DataSeriesMapper([]);
    temp._mapping = new Map(JSON.parse(json));
    return temp;
  }
}

export class Entry {
  public timestamp: number;
  public values: number[];

  /**
   * @param timestamp Unix timestamp in seconds
   * @param values Array of doubles, each index corrosponding to a specific dataseries,
   * the mapping of indexes to dataseries is not handled.
   */
  constructor(timestamp: number, value: number[]) {
    this.timestamp = timestamp;
    this.values = value;
  }
}
