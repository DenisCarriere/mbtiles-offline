import * as fs from 'fs'
import * as path from 'path'
import { MBTiles, Metadata } from './'

describe('Metadata', () => {
  test('update', async () => {
    const mbtiles = new MBTiles('update.mbtiles')
    const metadata: Metadata = {
      name: 'foo',
      bounds: [-110, -20, 130, 30],
    }
    expect(await mbtiles.update(metadata)).toBeTruthy()
    expect(await mbtiles.metadata()).toEqual(metadata)
    fs.unlinkSync('update.mbtiles')
  })

  test('index', async () => {
    const mbtiles = new MBTiles('index.mbtiles')
    expect(await mbtiles.index()).toBeTruthy()
    fs.unlinkSync('index.mbtiles')
  })
})

describe('Save', async () => {
  const mbtiles = new MBTiles('save.mbtiles')
  const tileData = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png'))
  const save = await mbtiles.save([0, 0, 0], tileData)
  const deleted = await mbtiles.delete([0, 0, 0])
  test('[0, 0, 0]', () => expect(save).toBeTruthy())
  test('[0, 0, 0]', () => expect(deleted).toBeTruthy())
  fs.unlinkSync('save.mbtiles')
})

describe('Read', () => {
  test('tile', async () => {
    const mbtiles = new MBTiles(path.join(__dirname, 'fixtures', 'world.mbtiles'))
    const data = await mbtiles.tile([0, 0, 0])
    expect(data).toEqual(fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png')))
  })
  test('tile - error', async () => {
    const mbtiles = new MBTiles(path.join(__dirname, 'fixtures', 'world.mbtiles'))
    await mbtiles.tile([5, 0, 0]).catch(error => expect(error).toBeDefined())
  })
})
