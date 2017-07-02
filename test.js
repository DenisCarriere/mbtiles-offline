const fs = require('fs')
const path = require('path')
const load = require('load-json-file')
const test = require('tape')
const write = require('write-json-file')
const {copySync} = require('fs-extra')
const MBTiles = require('./')

const options = {
  name: 'Foo',
  description: 'Bar',
  minzoom: 1,
  maxzoom: 3,
  format: 'png',
  center: [-7.5, 5],
  bounds: [-110, -40, 95, 50]
}

const baseMetadata = {
  type: 'baselayer',
  version: '1.1.0'
}

const metadata = Object.assign({}, baseMetadata, options)

const metadataPlain1 = {
  bounds: [ -179.9999999749438, -69.99999999526695, 179.9999999749438, 84.99999999782301 ],
  center: [ 0, 7.5 ],
  description: 'demo description',
  format: 'png',
  json: '{"level1":{"level2":"property"},"version":"2.0.0"}',
  maxzoom: 4,
  minzoom: 0,
  name: 'plain_1',
  type: 'baselayer',
  version: '1.1.0'
}

const directories = {
  out: path.join(__dirname, 'test', 'out') + path.sep,
  in: path.join(__dirname, 'test', 'in') + path.sep
}

const image = fs.readFileSync(path.join(directories.in, 'images', '0', '0', '0.png'))
const fixtures = fs.readdirSync(directories.in).filter(filename => filename.match(/\.mbtiles/))

test('MBTiles -- plain_1', async t => {
  const mbtiles = new MBTiles(directories.in + 'plain_1.mbtiles')

  t.deepEqual(await mbtiles.metadata(), metadataPlain1, 'metadata')
  t.assert(await mbtiles.tables(), 'tables')
  t.equal((await mbtiles.count()), 285, 'count')
  t.equal((await mbtiles.findAll()).length, 285, 'findAll')
  t.equal((await mbtiles.findOne([0, 0, 0])).byteLength, 7072, 'findOne')
  t.equal((await mbtiles.findOne([15, 9, 4])).byteLength, 1167, 'findOne - resolves correctly')
  t.equal((await mbtiles.hashes()).size, 285, 'hashes')
  t.equal(mbtiles.hash([0, 0, 0]), 1, 'hash')
  t.end()
})

test('MBTiles -- save', async t => {
  copySync(directories.in + 'save.mbtiles', directories.out + 'save.mbtiles')
  const mbtiles = new MBTiles(directories.out + 'save.mbtiles')

  t.true(await mbtiles.index(), 'index')
  t.true(await mbtiles.save([0, 0, 0], image), 'save - [0, 0, 0]')
  t.true(await mbtiles.save([1, 1, 1], image), 'save - [1, 1, 1]')
  t.true(await mbtiles.delete([1, 1, 1]), 'delete - [1, 1, 1]')
  t.deepEqual(await mbtiles.update(options), metadata, 'update')
  t.end()
})

test('MBTiles -- blank', async t => {
  const mbtiles = new MBTiles(directories.in + 'blank.mbtiles')

  t.deepEqual(await mbtiles.metadata(), baseMetadata, 'metadata')
  t.equal(await mbtiles.count(), 0, 'count')
  t.true(await mbtiles.tables(), 'tables')
  t.equal((await mbtiles.findAll()).length, 0, 'findAll')
  t.not(await mbtiles.findOne([0, 0, 0]), 'findOne')
  t.not(await mbtiles.findOne([10, 0, 0]), 'findOne')
  t.equal((await mbtiles.hashes()).size, 0, 'hashes')
  t.equal(await mbtiles.hash([0, 0, 0]), 1, 'hash')
  t.end()
})

test('MBTiles -- metadata', t => {
  for (const filename of fixtures) {
    const {name} = path.parse(filename)
    const mbtiles = new MBTiles(directories.in + filename)

    mbtiles.metadata().then(metadata => {
      const output = path.join(directories.out, `metadata-${name}.json`)
      if (process.env.REGEN) write.sync(output, metadata)
      t.deepEqual(metadata, load.sync(output), filename)
    })
  }
  t.end()
})
