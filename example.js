const fs = require('fs')
const MBTiles = require('.')

const mbtiles = new MBTiles('./fixtures/empty.mbtiles')
// mb.metadata(data => console.log(data))
const options = {
  name: 'Foo',
  description: 'Bar',
  minzoom: 1,
  maxzoom: 3,
  format: 'png',
  bounds: [-110, -40, 95, 50]
}
const image = fs.readFileSync('./fixtures/images/0/0/0.png')

// mbtiles.metadata()
//   .then(metadata => console.log(metadata))
// mbtiles.count()
//   .then(count => console.log(count))
// mbtiles.update(options)
//   .then(metadata => console.log(metadata))
// mbtiles.tables()
//   .then(() => console.log('done'))

mbtiles.save([0, 0, 0], image)
  .then(() => console.log('done'))
