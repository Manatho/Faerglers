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
