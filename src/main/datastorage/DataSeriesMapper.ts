/**
 * Maps dataseries names to zero-indexed numbers, used for low level storage and retrival
 */
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
    let map = new Map<string, number>(JSON.parse(json));
    let entries = [...map].sort((a, b) => (a[1] < b[1] ? -1 : 1)).map(v => v[0]);
    let temp = new DataSeriesMapper(entries);
    return temp;
  }
}
