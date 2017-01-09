import { MBTiles } from '../'

const mbtiles = new MBTiles('../fixtures/plain_1.mbtiles')

mbtiles.findAll([], {queue: 10000}).then(data => console.log(data.length))
mbtiles.findAll([], {limit: 5, buffer: true}).then(data => console.log(data.length))
mbtiles.findAllId().then(data => console.log(data.length))
mbtiles.findAllId([[0, 0, 0]]).then(data => console.log(data))
