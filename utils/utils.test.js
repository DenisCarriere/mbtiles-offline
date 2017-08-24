const path = require('path')
const test = require('tape')
const utils = require('./')

test('Utils -- getFiles', t => {
  t.assert(utils.getFiles(path.join(__dirname, '..', 'test', 'in')), 'getFiles')
  t.end()
})

// http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/
test('Utils -- Tile Parser -- Quadkey', t => {
  const parser = utils.getTileParser('quadkey')
  t.deepEqual(parser.schemaToTile('00'), [0, 3, 2])
  t.deepEqual(parser.tileToSchema([0, 3, 2]), '00')
  t.end()
})

test('Utils -- Tile Parser -- XYZ', t => {
  const parser = utils.getTileParser('xyz')
  t.deepEqual(parser.schemaToTile([0, 3, 2]), [0, 0, 2])
  t.deepEqual(parser.tileToSchema([0, 0, 2]), [0, 3, 2])
  t.deepEqual(parser.tileToSchema([15, 9, 4]), [15, 6, 4])
  t.end()
})

test('Utils -- Tile Parser -- TMS', t => {
  const parser = utils.getTileParser('tms')
  t.deepEqual(parser.schemaToTile([0, 3, 2]), [0, 3, 2])
  t.deepEqual(parser.tileToSchema([0, 3, 2]), [0, 3, 2])
  t.end()
})

test('Utils -- parseMetadata', t => {
  t.deepEqual(utils.parseMetadata([{name: 'center', value: '110,30,800'}]), {center: [110, 30, 800]}, 'center [x,y,z]')
  t.deepEqual(utils.parseMetadata([{name: 'center', value: '110,30'}]), {center: [110, 30]}, 'center [x,y]')
  t.deepEqual(utils.parseMetadata([{name: 'type', value: 'baselayer'}]), {type: 'baselayer'}, 'type')
  t.deepEqual(utils.parseMetadata([{name: 'name', value: 'foo'}]), {name: 'foo'}, 'name')
  t.deepEqual(utils.parseMetadata([{name: 'bounds', value: '-110,-20,130,30'}]), {bounds: [-110, -20, 130, 30]}, 'bounds')
  t.deepEqual(utils.parseMetadata([{name: 'format', value: 'png'}]), {format: 'png'}, 'format png')
  t.deepEqual(utils.parseMetadata([{name: 'format', value: 'jpeg'}]), {format: 'jpeg'}, 'format jpeg')
  t.deepEqual(utils.parseMetadata([{name: 'version', value: '1.1.0'}]), {version: '1.1.0'}, 'version')
  t.deepEqual(utils.parseMetadata([{name: 'minzoom', value: '10'}]), {minzoom: 10}, 'minzoom')
  t.deepEqual(utils.parseMetadata([{name: 'maxzoom', value: '18'}]), {maxzoom: 18}, 'maxzoom')
  t.deepEqual(utils.parseBounds([-20, -30, 20, 30]), [-20, -30, 20, 30], 'bounds single')
  t.deepEqual(utils.parseBounds([[-20, -30, 20, 30], [-110, -30, 120, 80]]), [-110, -30, 120, 80], 'bounds multiple')
  t.deepEqual(utils.parseBounds(require(path.join(__dirname, '..', 'test', 'in', 'extent.json'))), [-80, 45, -75, 50], 'bounds geojson')
  t.end()
})

test('Utils -- throws', t => {
  t.throws(() => utils.getTileParser(''), /schema is required/)
  t.throws(() => utils.getTileParser('foo'), 'invalid tile parser')
  t.end()
})
