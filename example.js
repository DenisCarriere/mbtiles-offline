const fs = require('fs')
const MBTiles = require('./')

const mbtiles = new MBTiles('./test/in/plain_1.mbtiles')
mbtiles.metadata().then(data => console.log(data))
mbtiles.findOne([1, 2, 2]).then(data => fs.writeFileSync('tile.png', data))
mbtiles.hashes().then(index => Object.keys(index))
