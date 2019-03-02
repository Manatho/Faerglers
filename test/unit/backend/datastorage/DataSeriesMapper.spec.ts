import { expect } from 'chai';
import { DataSeriesMapper } from '../../../../src/main/datastorage/DataSeriesMapper';

describe('DataSeriesMapper', () => {
  let dsmapper: DataSeriesMapper;
  let dsmapperJson: string;
  before(() => {
    dsmapper = new DataSeriesMapper(['dataseries1', 'dataseries2', 'dataseries3']);
    dsmapperJson = dsmapper.toJson();
  });

  it('Should map dataseries to number indexes according to order', () => {
    expect(dsmapper.indexOf('dataseries1')).to.equal(0);
    expect(dsmapper.indexOf('dataseries2')).to.equal(1);
    expect(dsmapper.indexOf('dataseries3')).to.equal(2);
  });
  it('Should be parsed to correct json', () => {
    expect(dsmapper.toJson()).to.equal('[["dataseries1",0],["dataseries2",1],["dataseries3",2]]');
  });
  it('Should be able to create instance from json', () => {
    let dsMapperFromJson = DataSeriesMapper.fromJson(dsmapperJson);
    expect(dsMapperFromJson).to.deep.equal(dsmapper);
  });
  it('Should map indexes correctly when parsing from json based on key rather than order', () => {
    let dsMapperFromJson = DataSeriesMapper.fromJson('[["dataseries2",1],["dataseries3",2], ["dataseries1",0]]');
    expect(dsMapperFromJson).to.deep.equal(dsmapper);
  });
});
