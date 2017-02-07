const MBTiles = require('./')

const mbtiles = new MBTiles('./test/out/blank2.mbtiles')
// mbtiles.metadata().then(data => console.log(data))
// mbtiles.findOne([1, 2, 2]).then(data => fs.writeFileSync('tile.png', data))
mbtiles.hashes().then(index => console.log(index))
