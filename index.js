const assign = require('lodash').assign
const entries = require('lodash').entries
const omit = require('lodash').omit
const mercator = require('global-mercator')
const utils = require('./utils')
const schema = require('./schema')

/**
 * MBTiles
 */
module.exports = class MBTiles {
  /**
   * MBTiles
   *
   * @param {string} uri Path to MBTiles
   * @returns {MBTiles} MBTiles
   * @example
   * const mbtiles = new MBTiles('example.mbtiles')
   * //=mbtiles
   */
  constructor (uri) {
    this.db = utils.connect(uri)
    this.uri = uri
    this.version = '1.1.0'
    this.type = 'baselayer'
  }

  /**
   * Save buffer data to individual Tile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @param {Buffer} image Tile image
   * @returns {Promise<boolean>}
   * @example
   * mbtiles.save([x, y, z], buffer)
   *   .then(status => console.log(status))
   */
  save (tile, image) {
    const [x, y, z] = tile
    return new Promise((resolve, reject) => {
      this.tables().then(() => {
        this.db.run('INSERT INTO tiles (tile_column, tile_row, zoom_level, tile_data) VALUES (?, ?, ?, ?)', [x, y, z, image], error => {
          if (error) { utils.error(error) }
          return resolve(true)
        })
      })
    })
  }

  /**
   * Retrieves Metadata from MBTiles
   *
   * @returns {Promise<Metadata>} Metadata as an Object
   * @example
   * mbtiles.metadata()
   *   .then(metadata => console.log(metadata))
   */
  metadata () {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(schema.TABLE.metadata)
        this.db.all('SELECT * FROM metadata', (error, rows) => {
          if (error) { utils.error(error) }

          const metadata = utils.parseMetadata(rows)
          this.attribution = metadata.attribution || this.attribution
          this.bounds = metadata.bounds || this.bounds
          this.center = metadata.center || this.center
          this.description = metadata.description || this.description
          this.format = metadata.format || this.format
          this.name = metadata.name || this.name
          this.minzoom = metadata.minzoom || this.minzoom
          this.maxzoom = metadata.maxzoom || this.maxzoom
          this.type = metadata.type || this.type
          this.version = metadata.version || this.version
          this.url = metadata.url || this.url
          const results = JSON.parse(JSON.stringify(omit(this, ['_table', '_index'])))
          delete results.db
          delete results.uri
          return resolve(results)
        })
      })
    })
  }

  /**
   * Delete individual Tile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @returns {Promise<boolean>}
   * @example
   * mbtiles.delete([x, y, z])
   *   .then(status => console.log(status))
   */
  delete (tile) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM tiles WHERE tile_column=? AND tile_row=? AND zoom_level=?', tile, error => {
        if (error) { utils.error(error) }
        return resolve(true)
      })
    })
  }

  /**
   * Count the amount of Tiles
   *
   * @returns {Promise<number>}
   * @example
   * mbtiles.count()
   *   .then(count => console.log(count))
   */
  count () {
    return new Promise(resolve => {
      this.db.serialize(() => {
        this.db.run(schema.TABLE.tiles)
        this.db.get('SELECT count(*) FROM tiles', (error, row) => {
          const result = row && row['count(*)'] || 0
          if (error) { utils.warning(error) }
          return resolve(Number(result))
        })
      })
    })
  }

  /**
   * Update Metadata
   *
   * @param {Metadata} [metadata={}] Metadata according to MBTiles spec 1.1.0
   * @param {string} metadata.attribution Attribution
   * @param {BBox} metadata.bounds Bounds [west, south, east, north]
   * @param {Center} metadata.center Center [lng, lat] or [lng, lat, height]
   * @param {string} metadata.description Description
   * @param {Formats} metadata.format Format 'png' | 'jpg' | 'webp' | 'pbf'
   * @param {number} metadata.minzoom Minimum zoom level
   * @param {number} metadata.maxzoom Maximum zoom level
   * @param {string} metadata.name Name
   * @param {string} metadata.url URL source or tile scheme
   * @param {Types} [metadata.type='baselayer'] Type 'baselayer' | 'overlay'
   * @param {Versions} [metadata.version='1.1.0'] Version '1.0.0' | '1.1.0' | '1.2.0'
   * @returns {Promise<Metadata>} Metadata
   * @example
   * const options = {
   *   name: 'Foo',
   *   description: 'Bar',
   *   minzoom: 1,
   *   maxzoom: 3,
   *   format: 'png',
   *   bounds: [-110, -40, 95, 50]
   * }
   * mbtiles.update(options)
   *   .then(metadata => console.log(metadata))
   */
  update (metadata = {}) {
    return new Promise((resolve, reject) => {
      this.metadata().then(currentMetadata => {
        this.db.serialize(() => {
          this.db.run(schema.TABLE.metadata)
          this.db.run('DELETE FROM metadata')
          const results = assign(currentMetadata, metadata)

          // Validate Metadata
          // MBTiles spec 1.0.0
          if (results.name === undefined) { utils.error('Metadata <name> is required') }
          if (results.bounds === undefined) { utils.error('Metadata <bounds> is required') }
          if (results.version === undefined) { utils.error('Metadata <version> is required') }
          if (results.type === undefined) { utils.error('Metadata <type> is required') }

          // MBTiles spec 1.1.0
          if (results.version === '1.1.0') {
            if (results.format === undefined) { utils.error('Metadata <format> is required') }
          }

          // Parse center when bounds is available
          if (results.center === undefined && metadata.bounds) {
            results.center = mercator.bboxToCenter(metadata.bounds)
          }

          // Load Metadata to database
          const stmt = this.db.prepare('INSERT INTO metadata VALUES (?, ?)')
          for (const [name, value] of entries(results)) {
            // String or Number
            if (typeof value !== 'object') {
              stmt.run([name, String(value)])
            // Array
            } else if (value.length) {
              stmt.run([name, value.join(',')])
            // JSON
            } else {
              stmt.run([name, JSON.stringify(value)])
            }
          }
          stmt.finalize()
          return resolve(results)
        })
      })
    })
  }

  /**
   * Finds all Tile unique hashes
   *
   * @returns {Promise<Tile[]>} An array of Tiles [x, y, z]
   * @example
   * mbtiles.findAll()
   *   .then(tiles => console.log(tiles))
   */
  findAll () {
    return new Promise((resolve, reject) => {
      this.tables().then(() => {
        this.db.all(`SELECT tile_column, tile_row, zoom_level FROM tiles`, (error, rows) => {
          if (error) { utils.error(error) }
          const tiles = rows.map(row => [row.tile_column, row.tile_row, row.zoom_level])
          if (tiles.length === 0) { utils.warning('<findAll> is empty') }
          resolve(tiles)
        })
      })
    })
  }

  /**
   * Finds one Tile and returns Buffer
   *
   * @param {Tile} tile Tile [x, y, z]
   * @return {Promise<Buffer>} Tile Data
   * @example
   * mbtiles.findOne([x, y, z])
   *   .then(image => console.log(image))
   */
  findOne (tile) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT tile_data FROM tiles WHERE tile_column=? AND tile_row=? AND zoom_level=?', tile, (error, row) => {
        if (error) {
          utils.error(error)
        } else if (row) {
          return resolve(row.tile_data)
        } else {
          utils.warning('<findOne> not found')
          return resolve(undefined)
        }
      })
    })
  }

  /**
   * Build SQL tables
   *
   * @returns {Promise<boolean>}
   * @example
   * mbtiles.tables()
   *   .then(status => console.log(status))
   */
  tables () {
    return new Promise(resolve => {
      if (this._table) { return resolve(true) }
      this.db.serialize(() => {
        this.db.run(schema.TABLE.metadata)
        this.db.run(schema.TABLE.tiles, () => {
          this._table = true
          return resolve(true)
        })
      })
    })
  }

  /**
   * Build SQL index
   *
   * @returns {Promise<boolean>}
   * @example
   * mbtiles.index()
   *   .then(status => console.log(status))
   */
  index () {
    return new Promise(resolve => {
      if (this._index) { return resolve(true) }
      this.db.serialize(() => {
        this.db.run(schema.INDEX.metadata, () => {
          this._index = true
          return resolve(true)
        })
      })
    })
  }
  /**
   * Creates hash from a single Tile
   *
   * @param {Tile} tile
   * @return {number} hash
   * @example
   * const hash = mbtiles.hash([5, 25, 30])
   * //=hash
   */
  hash (tile) {
    return mercator.hash(tile)
  }

  /**
   * Creates a hash table for all tiles
   *
   * @return {Promise<Object>} hashes
   */
  hashes () {
    return new Promise((resolve, reject) => {
      this.findAll().then(tiles => {
        const index = {}
        for (const tile of tiles) { index[mercator.hash(tile)] = true }
        if (Object.keys(index).length === 0) { utils.warning('<hashes> is empty') }
        return resolve(index)
      })
    })
  }
}
