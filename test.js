const path = require('path')
const assign = require('lodash').assign
const fs = require('fs')
const MBTiles = require('.')
const load = require('load-json-file')
const write = require('write-json-file')

const options = {
  name: 'Foo',
  description: 'Bar',
  minzoom: 1,
  maxzoom: 3,
  format: 'png',
  bounds: [-110, -40, 95, 50]
}

const directories = {
  out: path.join(__dirname, 'test', 'out') + path.sep,
  in: path.join(__dirname, 'test', 'in') + path.sep
}

const metadata = assign(options, {
  type: 'baselayer',
  version: '1.1.0',
  center: [-7.5, 5]
})

const image = fs.readFileSync(path.join(directories.in, 'images', '0', '0', '0.png'))

const fixtures = fs.readdirSync(directories.in).filter(filename => filename.match(/\.mbtiles/))

describe('plain_1', () => {
  const mbtiles = new MBTiles(directories.in + 'plain_1.mbtiles')
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
  const mbtiles = new MBTiles(directories.in + 'save.mbtiles')
  test('index', () => mbtiles.index().then(data => expect(data).toBeDefined()))
  test('save', () => mbtiles.save([0, 0, 0], image).then(data => expect(data).toBeDefined()))
  test('update', () => mbtiles.update(options).then(data => expect(data).toEqual(metadata)))
  test('delete', () => mbtiles.delete([0, 0, 0]).then(data => expect(data).toBeDefined()))
})

describe('blank', () => {
  const mbtiles = new MBTiles(directories.in + 'blank.mbtiles')
  test('metadata', () => mbtiles.metadata().then(data => expect(data).toBeDefined()))
  test('count', () => mbtiles.count().then(data => expect(data).toBeDefined()))
  test('tables', () => mbtiles.tables().then(data => expect(data).toBeDefined()))
  test('findAll', () => mbtiles.findAll().then(data => expect(data).toBeDefined()))
  test('findOne', () => mbtiles.findOne([0, 0, 0]).then(data => expect(data).toBeUndefined()))
  test('findOne - undefined', () => mbtiles.findOne([10, 0, 0]).then(data => expect(data).toBeUndefined()))
  test('hashes', () => mbtiles.hashes().then(index => expect(index).toBeDefined()))
  test('hash', () => expect(mbtiles.hash([0, 0, 0])).toBeDefined())
})

describe('metadata', () => {
  for (const filename of fixtures) {
    const name = path.parse(filename).name
    const mbtiles = new MBTiles(directories.in + filename)
    test(name, () => {
      mbtiles.metadata().then(metadata => {
        if (process.env.REGEN) {
          write.sync(directories.out + 'metadata-' + name + '.json', metadata)
        }
        expect(metadata).toEqual(load.sync(directories.out + 'metadata-' + name + '.json'))
      })
    })
  }
})
