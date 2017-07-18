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
  const db = new MBTiles(directories.in + 'plain_1.mbtiles')

  t.deepEqual(await db.metadata(), metadataPlain1, 'metadata')
  t.assert(await db.tables(), 'tables')
  t.equal((await db.count()), 285, 'count')
  t.equal((await db.findAll()).length, 285, 'findAll')
  t.equal((await db.findOne([0, 0, 0])).byteLength, 7072, 'findOne')
  t.equal((await db.findOne([15, 9, 4])).byteLength, 1167, 'findOne - resolves correctly')
  t.equal((await db.hashes()).size, 285, 'hashes')
  t.equal(db.hash([0, 0, 0]), 1, 'hash')
  t.end()
})

test('MBTiles -- save', async t => {
  copySync(directories.in + 'save.mbtiles', directories.out + 'save.mbtiles')
  const db = new MBTiles(directories.out + 'save.mbtiles')

  t.true(await db.index(), 'index')
  t.true(await db.save([0, 0, 0], image), 'save - [0, 0, 0]')
  t.true(await db.save([1, 1, 1], image), 'save - [1, 1, 1]')
  t.true(await db.delete([1, 1, 1]), 'delete - [1, 1, 1]')
  t.deepEqual(await db.update(options), metadata, 'update')
  t.end()
})

test('MBTiles -- delete quadkey', async t => {
  const db = new MBTiles(directories.out + 'delete.mbtiles', 'quadkey')
  await db.save('031', Buffer([0, 1]))
  t.equal(await db.count(), 1)
  await db.delete('031')
  t.equal(await db.count(), 0)
  t.end()
})

test('MBTiles -- hashes', async t => {
  const db1 = new MBTiles(directories.out + 'hashes-quadkey.mbtiles', 'quadkey')
  await db1.save('021', Buffer([0, 1]))
  const db2 = new MBTiles(directories.out + 'hashes-tms.mbtiles', 'tms')
  await db2.save([1, 5, 3], Buffer([0, 1]))
  const db3 = new MBTiles(directories.out + 'hashes-xyz.mbtiles', 'xyz')
  await db3.save([1, 2, 3], Buffer([0, 1]))

  const hashes1 = await db1.hashes()
  const hashes2 = await db2.hashes()
  const hashes3 = await db3.hashes()

  t.true(hashes1.has(hashes2.values().next().value))
  t.true(hashes2.has(hashes3.values().next().value))
  t.end()
})

test('MBTiles -- blank', async t => {
  const db = new MBTiles(directories.in + 'blank.mbtiles')

  t.deepEqual(await db.metadata(), baseMetadata, 'metadata')
  t.equal(await db.count(), 0, 'count')
  t.true(await db.tables(), 'tables')
  t.equal((await db.findAll()).length, 0, 'findAll')
  t.not(await db.findOne([0, 0, 0]), 'findOne')
  t.not(await db.findOne([10, 0, 0]), 'findOne')
  t.equal((await db.hashes()).size, 0, 'hashes')
  t.equal(await db.hash([0, 0, 0]), 1, 'hash')
  t.end()
})

test('MBTiles -- metadata', t => {
  for (const filename of fixtures) {
    const {name} = path.parse(filename)
    const db = new MBTiles(directories.in + filename)

    db.metadata().then(metadata => {
      const output = path.join(directories.out, `metadata-${name}.json`)
      if (process.env.REGEN) write.sync(output, metadata)
      t.deepEqual(metadata, load.sync(output), filename)
    })
  }
  t.end()
})

test('MBTiles -- jpg metadata (not JPEG)', t => {
  const db = new MBTiles(directories.out + 'format-jpg.mbtiles')
  db.update({format: 'jpg'})
    .then(metadata => t.equal(metadata.format, 'jpg'))
  t.end()
})
