const fs = require('fs')
const path = require('path')
const MBTiles = require('.').MBTiles

const metadata = {
  bounds: [-110, -20, 130, 30],
  format: 'png',
  name: 'test'
}

describe('Metadata', () => {
  const mbtiles = new MBTiles('Metadata.mbtiles', metadata)

  test('update', () => mbtiles.update(metadata).then(data => expect(data).toBeTruthy()))
  test('getMetadata', () => mbtiles.metadata().then(data => expect(data).toEqual(metadata)))
  test('index', () => mbtiles.index().then(data => expect(data).toBeTruthy()))
  test('init', () => mbtiles.init().then(data => expect(data).toBeTruthy()))
  test('tables', () => mbtiles.tables().then(data => expect(data).toBeTruthy()))
})

describe('CRUD', () => {
  const mbtiles = new MBTiles('CRUD.mbtiles', metadata)
  const tileData = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png'))
  mbtiles.index().then(() => {
    test('noData', () => mbtiles.findOne([999, 999, 999])).then(data => expect(data).toBeUndefined())
    test('save', () => mbtiles.save([0, 0, 0], tileData)).then(data => expect(data).toBeTruthy())
    test('overwrite', () => mbtiles.save([0, 0, 0], tileData, true)).then(data => expect(data).toBeTruthy())
    test('findOne', () => mbtiles.findOne([0, 0, 0])).then(data => expect(data).toEqual(tileData))
    test('deleted', () => mbtiles.delete([0, 0, 0])).then(data => expect(data).toBeTruthy())
  })
})

// describe('findAll', () => {
//   const mbtiles = new MBTiles('./fixtures/plain_1.mbtiles')

//   test('undefined', () => mbtiles.findAllId().then(data => expect(data.length).toBe(285)))
//   test('[]', () => mbtiles.findAllId([]).then(data => expect(data.length).toBe(285)))
//   test('queue', () => mbtiles.findAllId([], {queue: 50}).then(data => expect(data.length).toBe(285)))
//   test('limit', () => mbtiles.findAllId([], {limit: 50}).then(data => expect(data.length).toBe(50)))
//   test('[0, 0, 0]', () => expect(await mbtiles.findAllId([[0, 0, 0]])).toEqual([1]))
// })

// describe('MOBAC', () => {
//   const mbtiles = new MBTiles('./fixtures/MOBAC.mbtiles')
//   const meta = await mbtiles.metadata()
//   test('metadata', () => expect(meta.name).toBeDefined())
// })

afterAll(() => {
  fs.unlinkSync('CRUD.mbtiles')
  fs.unlinkSync('Metadata.mbtiles')
})
