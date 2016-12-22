import { MBTiles } from './'
import * as fs from 'fs'

const mbtiles = new MBTiles('test/fixtures/plain_1.mbtiles')
mbtiles.metadata().then(data => console.log(data))
mbtiles.getTile([0, 0, 0]).then(data => {
    console.log(data)
    fs.writeFileSync('image.png', data)
})
// test('hash', () => expect(mbtiles.hash(4, 312, 480)).toBe(5728))
