import { MBTiles } from '../'
import * as fs from 'fs'
import * as path from 'path'

describe('Metadata', () => {
  test('getMetadata', async () => {
    const mbtiles = new MBTiles('setMetadata.mbtiles')
    const metadata = {name: 'Foo', description: 'bar'}
    await mbtiles.setMetadata(metadata)
    expect(await mbtiles.getMetadata()).toEqual(metadata)
    fs.unlinkSync('setMetadata.mbtiles')
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
})
