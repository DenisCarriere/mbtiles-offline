const MBTiles = require('.')
const schema = require('./schema')

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

mbtiles.metadata()
  .then(metadata => console.log(metadata))
mbtiles.count()
  .then(count => console.log(count))
mbtiles.update(options)
  .then(metadata => console.log(metadata))
mbtiles.tables()
  .then(() => console.log('done'))

