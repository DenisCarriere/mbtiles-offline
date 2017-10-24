const fs = require('fs')
const path = require('path')
const load = require('load-json-file')
const test = require('tape')
const write = require('write-json-file')
const copySync = require('fs-extra').copySync
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

test('MBTiles -- plain_1', t => {
  const db = new MBTiles(directories.in + 'plain_1.mbtiles')

  Promise.all([
    db.metadata().then(metadata => t.deepEqual(metadata, metadataPlain1, 'metadata')),
    db.tables().then(status => t.assert(status, 'tables')),
    db.count().then(count => t.equal(count, 285, 'count')),
    db.findAll().then(tiles => t.equal(tiles.length, 285, 'findAll')),
    db.findOne([0, 0, 0]).then(image => t.equal(image.byteLength, 7072, 'findOne')),
    db.findOne([15, 9, 4]).then(image => t.equal(image.byteLength, 1167, 'findOne - resolves correctly')),
    db.hashes().then(hashes => t.equal(hashes.size, 285, 'hashes'))
  ]).then(() => {
    t.equal(db.hash([0, 0, 0]), 1, 'hash')
    t.end()
  })
})

test('MBTiles -- save', t => {
  copySync(directories.in + 'save.mbtiles', directories.out + 'save.mbtiles')
  const db = new MBTiles(directories.out + 'save.mbtiles')

  Promise.all([
    db.index().then(status => t.true(status, 'index')),
    db.save([0, 0, 0], image).then(status => t.true(status, 'save - [0, 0, 0]')),
    db.save([1, 1, 1], image).then(status => t.true(status, 'save - [1, 1, 1]')),
    db.delete([1, 1, 1]).then(status => t.true(status, 'delete - [1, 1, 1]')),
    db.update(options).then(updatedMetadata => t.deepEqual(updatedMetadata, metadata, 'update'))
  ]).then(() => {
    t.end()
  })
})

test('MBTiles -- delete quadkey', t => {
  const db = new MBTiles(directories.out + 'delete.mbtiles', 'quadkey')
  Promise.all([
    db.save('031', Buffer.from([0, 1])),
    db.count().then(count => t.equal(count, 1, 'save count')),
    db.delete('031'),
    db.count().then(count => t.equal(count, 0, 'delete count'))
  ]).then(() => {
    t.end()
  })
})

test('MBTiles -- hashes', t => {
  const db1 = new MBTiles(directories.out + 'hashes-quadkey.mbtiles', 'quadkey')
  const db2 = new MBTiles(directories.out + 'hashes-tms.mbtiles', 'tms')
  const db3 = new MBTiles(directories.out + 'hashes-xyz.mbtiles', 'xyz')

  Promise.all([
    db1.save('021', Buffer.from([0, 1])),
    db2.save([1, 5, 3], Buffer.from([0, 1])),
    db3.save([1, 2, 3], Buffer.from([0, 1]))
  ]).then(() => {
    db1.hashes().then(hashes1 => {
      db2.hashes().then(hashes2 => {
        db3.hashes().then(hashes3 => {
          t.true(hashes1.has(hashes2.values().next().value), 'hashes1 contains hashes2')
          t.true(hashes2.has(hashes3.values().next().value), 'hashes2 contains hashes2')
        })
      })
    })
  })

  t.end()
})

test('MBTiles -- blank', t => {
  const db = new MBTiles(directories.in + 'blank.mbtiles')

  Promise.all([
    db.metadata().then(metadata => t.deepEqual(metadata, baseMetadata, 'metadata')),
    db.count().then(count => t.equal(count, 0, 'count')),
    db.tables().then(status => t.true(status, 'tables')),
    db.findAll().then(tiles => t.equal(tiles.length, 0, 'findAll')),
    db.findOne([0, 0, 0]).then(image => t.not(image, 'findOne')),
    db.findOne([10, 0, 0]).then(image => t.not(image, 'findOne')),
    db.hashes().then(hashes => t.equal(hashes.size, 0, 'hashes'))
  ])
  .then(() => {
    t.equal(db.hash([0, 0, 0]), 1, 'hash')
    t.end()
  })
})

test('MBTiles -- metadata', t => {
  for (const filename of fixtures) {
    const name = path.parse(filename).name
    const db = new MBTiles(directories.in + filename)

    db.metadata().then(metadata => {
      const output = path.join(directories.out, `metadata-${name}.json`)
      if (process.env.REGEN) write.sync(output, metadata)
      t.deepEqual(metadata, load.sync(output), filename)
    }).catch(error => console.error(error))
  }
  t.end()
})

test('MBTiles -- jpg metadata (not JPEG)', t => {
  const db = new MBTiles(directories.out + 'format-jpg.mbtiles')
  db.update({format: 'jpg'}).then(metadata => t.equal(metadata.format, 'jpg'))
  t.end()
})

test('MBTiles -- findOneSync', t => {
  const db = new MBTiles(directories.in + 'plain_1.mbtiles')
  db.findOneSync([1, 1, 1], (error, image) => {
    if (error) t.fail(error)
    t.equal(image.byteLength, 2450)
  })
  t.end()
})

test('MBTiles -- metadata', t => {
  const db = new MBTiles(directories.in + 'plain_1.mbtiles')
  db.metadata((error, metadata) => {
    if (error) t.fail(error)
    t.deepEqual(metadata, metadataPlain1)
  })
  t.end()
})
