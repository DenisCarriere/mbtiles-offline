const MBTiles = require('./')

const mbtiles = new MBTiles('./test/in/plain_1.mbtiles')
// mbtiles.metadata().then(data => console.log(data))
// mbtiles.findOne([1, 2, 2]).then(data => fs.writeFileSync('tile.png', data))
// mbtiles.hashes().then(index => console.log(index))
mbtiles.hashes([[0, 0, 0], [0, 0, 1], [1, 1, 1], [0, 2, 2]]).then(data => console.log(data))
// mbtiles.findAll().then(data => console.log(data))
