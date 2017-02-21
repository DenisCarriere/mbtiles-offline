const path = require('path')
const utils = require('./utils')

describe('Utils', () => {
  test('getFiles', () => expect(utils.getFiles(path.join(__dirname, '..', 'test', 'in'))).toBeDefined())
})

describe('Metadata', () => {
  test('center [x,y,z]', () => expect(utils.parseMetadata([{name: 'center', value: '110,30,800'}])).toEqual({center: [110, 30, 800]}))
  test('center [x,y]', () => expect(utils.parseMetadata([{name: 'center', value: '110,30'}])).toEqual({center: [110, 30]}))
  test('type', () => expect(utils.parseMetadata([{name: 'type', value: 'baselayer'}])).toEqual({type: 'baselayer'}))
  test('name', () => expect(utils.parseMetadata([{name: 'name', value: 'foo'}])).toEqual({name: 'foo'}))
  test('bounds', () => expect(utils.parseMetadata([{name: 'bounds', value: '-110,-20,130,30'}])).toEqual({bounds: [-110, -20, 130, 30]}))
  test('format', () => expect(utils.parseMetadata([{name: 'format', value: 'png'}])).toEqual({format: 'png'}))
  test('version', () => expect(utils.parseMetadata([{name: 'version', value: '1.1.0'}])).toEqual({version: '1.1.0'}))
  test('minzoom', () => expect(utils.parseMetadata([{name: 'minzoom', value: '10'}])).toEqual({minzoom: 10}))
  test('maxzoom', () => expect(utils.parseMetadata([{name: 'maxzoom', value: '18'}])).toEqual({maxzoom: 18}))
  test('bounds single', () => expect(utils.parseBounds([-20, -30, 20, 30])).toEqual([-20, -30, 20, 30]))
  test('bounds multiple', () => expect(utils.parseBounds([[-20, -30, 20, 30], [-110, -30, 120, 80]])).toEqual([-110, -30, 120, 80]))
  test('bounds geojson', () => expect(utils.parseBounds(require(path.join(__dirname, '..', 'test', 'in', 'extent.json')))).toEqual([-80, 45, -75, 50]))
})
