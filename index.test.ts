import * as mbtiles from './'
// import * as fs from 'fs'

// const mbtiles = new MBTiles('test.mbtiles', {name: 'hey'})
// mbtiles.save([0, 0, 0], fs.readFileSync('./test/fixtures/images/0/0/0.png'))
// const mbtiles = new MBTiles('test/fixtures/plain_1.mbtiles')
// mbtiles.metadata().then(data => console.log(data))
// mbtiles.getTile([0, 0, 0]).then(data => {
//     console.log(data)
//     fs.writeFileSync('image.png', data)
// })

describe('bboxToCenter', () => {
  test('[west, south, east, north]', () => expect(mbtiles.bboxToCenter([90, -45, 85, -50])).toEqual([87.5, -47.5]))
})

describe('hash', () => {
  test('[x, y, z]', () => expect(mbtiles.hash([312, 480, 4])).toBe(5728))
})
