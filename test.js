const assign = require('lodash').assign
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

const metadata = assign(options, {
  type: 'baselayer',
  version: '1.1.0',
  center: [-7.5, 5]
})

const image = fs.readFileSync('./test/in/images/0/0/0.png')

describe('plain_1', () => {
  const mbtiles = new MBTiles('./test/in/plain_1.mbtiles')
  test('metadata', () => mbtiles.metadata().then(data => expect(data).toBeDefined()))
  test('count', () => mbtiles.count().then(data => expect(data).toBeDefined()))
  test('tables', () => mbtiles.tables().then(data => expect(data).toBeDefined()))
  test('findAll', () => mbtiles.findAll().then(data => expect(data).toBeDefined()))
  test('findOne', () => mbtiles.findOne([0, 0, 0]).then(data => expect(data).toBeTruthy()))
  test('findOne - undefined', () => mbtiles.findOne([10, 0, 0]).then(data => expect(data).toBeUndefined()))
  test('hashes', () => mbtiles.hashes().then(index => expect(index).toBeDefined()))
  test('hash', () => expect(mbtiles.hash([0, 0, 0])).toBeDefined())
})

describe('save', () => {
  const mbtiles = new MBTiles('./test/out/save.mbtiles')
  test('index', () => mbtiles.index().then(data => expect(data).toBeDefined()))
  test('save', () => mbtiles.save([0, 0, 0], image).then(data => expect(data).toBeDefined()))
  test('update', () => mbtiles.update(options).then(data => expect(data).toEqual(metadata)))
  test('delete', () => mbtiles.delete([0, 0, 0]).then(data => expect(data).toBeDefined()))
})

describe('blank', () => {
  const mbtiles = new MBTiles('./test/out/blank.mbtiles')
  test('metadata', () => mbtiles.metadata().then(data => expect(data).toBeDefined()))
  test('count', () => mbtiles.count().then(data => expect(data).toBeDefined()))
  test('tables', () => mbtiles.tables().then(data => expect(data).toBeDefined()))
  test('findAll', () => mbtiles.findAll().then(data => expect(data).toBeDefined()))
  test('findOne', () => mbtiles.findOne([0, 0, 0]).then(data => expect(data).toBeUndefined()))
  test('findOne - undefined', () => mbtiles.findOne([10, 0, 0]).then(data => expect(data).toBeUndefined()))
  test('hashes', () => mbtiles.hashes().then(index => expect(index).toBeDefined()))
  test('hash', () => expect(mbtiles.hash([0, 0, 0])).toBeDefined())
})
