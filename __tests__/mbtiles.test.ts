import { MBTiles, Metadata, getFiles } from '../'
import * as fs from 'fs'
import * as path from 'path'

describe('Metadata', () => {
  test('getMetadata', async () => {
    const mbtiles = new MBTiles('setMetadata.mbtiles')
    const metadata: Metadata = {
      name: 'Foo',
      description: 'bar',
      version: '1.1.0',
      minzoom: 8,
      maxzoom: 13,
      center: [10, 30, 10],
      bounds: [-110, -20, 130, 50],
      type: 'baselayer',
      format: 'png'
    }
    await mbtiles.setMetadata(metadata)
    expect(await mbtiles.getMetadata()).toEqual(metadata)
    fs.unlinkSync('setMetadata.mbtiles')
  })

  test('getMetadata - Alternates', async () => {
    const mbtiles = new MBTiles('setMetadata-alts.mbtiles')
    const metadata: Metadata = {
      center: [10, 30]
    }
    await mbtiles.setMetadata(metadata)
    expect(await mbtiles.getMetadata()).toEqual(metadata)
    fs.unlinkSync('setMetadata-alts.mbtiles')
  })
})

describe('Utility', () => {
  test('getFiles', () => {
    expect(getFiles(path.join(__dirname, 'fixtures'))).toBeDefined()
  })
})


describe('Save', () => {
  test('[0, 0, 0]', async () => {
    const mbtiles = new MBTiles('save.mbtiles')
    const tileData = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png'))
    const data = await mbtiles.save([0, 0, 0], tileData)
    expect(data.tile_data).toEqual(tileData)
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
