import * as fs from 'fs'
import * as path from 'path'
import { MBTiles, Metadata } from './'

describe('Metadata', () => {
  test('setMetadata', async () => {
    const mbtiles = new MBTiles('setMetadata.mbtiles')
    const metadata: Metadata = {
      name: 'Foo',
      description: 'bar',
      version: '1.1.0',
      minzoom: 8,
      maxzoom: 13,
      center: [10, 30, 10],
      bounds: [-110, -20, 130, 30],
      type: 'baselayer',
      format: 'png'
    }
    expect(await mbtiles.setMetadata(metadata)).toBeTruthy()
    expect(await mbtiles.getMetadata()).toEqual(metadata)
    fs.unlinkSync('setMetadata.mbtiles')
  })

  test('index', async () => {
    const mbtiles = new MBTiles('index.mbtiles')
    expect(await mbtiles.index()).toBeTruthy()
    fs.unlinkSync('index.mbtiles')
  })
})

describe('Save', () => {
  test('[0, 0, 0]', async () => {
    const mbtiles = new MBTiles('save.mbtiles')
    const tileData = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png'))
    expect(await mbtiles.save([0, 0, 0], tileData)).toBeTruthy()
    fs.unlinkSync('save.mbtiles')
  })
})

describe('Read', () => {
  test('getTile', async () => {
    const mbtiles = new MBTiles(path.join(__dirname, 'fixtures', 'world.mbtiles'))
    const data = await mbtiles.getTile([0, 0, 0])
    expect(data).toEqual(fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png')))
  })
  test('getTile - error', async () => {
    const mbtiles = new MBTiles(path.join(__dirname, 'fixtures', 'world.mbtiles'))
    await mbtiles.getTile([5, 0, 0]).catch(reason => expect(reason).toBeDefined())
  })
})
