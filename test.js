const fs = require('fs')
const MBTiles = require('.')

const options = {
  name: 'Foo',
  description: 'Bar',
  minzoom: 1,
  maxzoom: 3,
  format: 'png',
  bounds: [-110, -40, 95, 50]
}
const image = fs.readFileSync('./fixtures/images/0/0/0.png')

describe('plain_1', () => {
  const mbtiles = new MBTiles('./fixtures/plain_1.mbtiles')
  test('metadata', () => mbtiles.metadata().then(data => expect(data).toBeDefined()))
  test('count', () => mbtiles.count().then(data => expect(data).toBeDefined()))
  test('tables', () => mbtiles.tables().then(data => expect(data).toBeDefined()))
  test('findAll', () => mbtiles.findAll().then(data => expect(data).toBeDefined()))
  test('findOne', () => mbtiles.findOne([0, 0, 0]).then(data => expect(data).toBeDefined()))
  test('findOne', () => mbtiles.findOne([10, 0, 0]).then(data => expect(data).toBeDefined()))
})

describe('blank', () => {
  const mbtiles = new MBTiles('./fixtures/blank.mbtiles')
  test('index', () => mbtiles.index().then(data => expect(data).toBeDefined()))
  test('save', () => mbtiles.save([0, 0, 0], image).then(data => expect(data).toBeDefined()))
  test('update', () => mbtiles.update(options).then(data => expect(data).toBeDefined()))
  test('delete', () => mbtiles.delete([0, 0, 0], image).then(data => expect(data).toBeDefined()))
})
