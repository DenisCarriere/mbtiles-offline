const fs = require('fs')
const MBTiles = require('./')

const mbtiles = new MBTiles('/Users/mac/mbtiles/world-imagery.mbtiles')
mbtiles.metadata().then(data => console.log(data))
mbtiles.findOne([1, 2, 2]).then(data => fs.writeFileSync('tile.png', data))
