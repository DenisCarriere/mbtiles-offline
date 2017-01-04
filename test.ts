import * as fs from 'fs'
import * as path from 'path'
import { MBTiles, Metadata } from '.'

const metadata: Metadata = {
  bounds: [-110, -20, 130, 30],
  format: 'png',
  name: 'test',
}

describe('Metadata', async () => {
  const mbtiles = new MBTiles('Metadata.mbtiles', metadata)

  test('update', async () => expect(await mbtiles.update(metadata)).toBeTruthy())

  test('getMetadata', async () => expect(await mbtiles.metadata()).toEqual(metadata))

  test('index', async () => expect(await mbtiles.index()).toBeTruthy())

  test('init', async () => expect(await mbtiles.init()).toBeTruthy())

  test('tables', async () => expect(await mbtiles.tables()).toBeTruthy())
})

describe('CRUD', async () => {
  const mbtiles = new MBTiles('CRUD.mbtiles', metadata)
  const tileData = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png'))

  test('noData', async () => expect(await mbtiles.findOne([0, 0, 0])).toBeUndefined())

  test('save', async () => expect(await mbtiles.save([0, 0, 0], tileData)).toBeTruthy())

  test('overwrite', async () => expect(await mbtiles.save([0, 0, 0], tileData, true)).toBeTruthy())

  test('findOne', async () => expect(await mbtiles.findOne([0, 0, 0])).toEqual(tileData))

  test('deleted', async () => expect(await mbtiles.delete([0, 0, 0])).toBeTruthy())
})

afterAll(() => {
  fs.unlinkSync('CRUD.mbtiles')
  fs.unlinkSync('Metadata.mbtiles')
})
