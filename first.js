const MBTiles = require('.')

const mbtiles = new MBTiles('./fixtures/plain_1.mbtiles')
// mb.metadata(data => console.log(data))

mbtiles.metadata().then(data => console.log(data))
