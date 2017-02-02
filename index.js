const assign = require('lodash').assign
const entries = require('lodash').entries
const async = require('async')
const mercator = require('global-mercator')
const tiletype = require('@mapbox/tiletype')
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
   * @returns {MBTiles} MBTiles
   * @example
   * const mbtiles = new MBTiles('example.mbtiles')
   * //=mbtiles
   */
  constructor (uri, metadata = {}) {
    this.db = utils.connect(uri)
    this.uri = uri
    this.version = metadata.version || '1.1.0'
    this.format = metadata.format
    this.name = metadata.name
    this.description = metadata.description
    this.attribution = metadata.attribution
    this.minzoom = metadata.minzoom
    this.maxzoom = metadata.maxzoom
    this.bounds = metadata.bounds
    this.center = metadata.center
    this.type = metadata.type || 'baselayer'
    this.url = metadata.url
  }

  /**
   * Save buffer data to individual Tile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @param {Buffer} image Tile image
   * @param {boolean} [overwrite=true] Allow overwrite save operations
   * @returns {Promise<boolean>} true/false
   * @example
   * mbtiles.save([x, y, z], buffer)
   *   .then(status => console.log(status))
   */
  save (tile, image, overwrite = true) {
    // Variables
    const tileId = mercator.hash(tile)
    const [x, y, z] = tile
    const entity = {
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id: tileId
    }
    // Detect Image file type if unknown
    if (!this.format) {
      this.format = tiletype.type(image)
    }

    return new Promise(resolve => {
      async.waterfall([

        // Init
        callback => {
          if (!this._init) {
            this.init().then(() => callback())
          } else { callback() }
        },

        // Overwrite existing
        callback => {
          if (overwrite) {
            this.delete(tile).then(() => callback())
          } else { callback() }
        },

        // Save Image
        callback => this.imagesSQL.create({ tile_data: image, tile_id: tileId }).then(() => callback()),
        callback => this.mapSQL.create(entity).then(() => callback()),
        callback => resolve(true)
      ])
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
          const results = JSON.parse(JSON.stringify(this))
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
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.delete([x, y, z])
   */
  delete (tile) {
    // Variables
    const tileId = mercator.hash(tile)
    const [x, y, z] = tile
    const entity = {
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id: tileId
    }
    return new Promise((resolve, reject) => {
      async.waterfall([
        // Initalize database
        callback => {
          if (!this._init) {
            this.init().then(() => callback())
          } else { callback() }
        },
        // Find one image tile & destroy
        callback => {
          this.imagesSQL.findOne({where: {tile_id: tileId}}).then(data => {
            if (data) {
              data.destroy().then(() => callback())
            } else { callback() }
          })
        },
        // Find one map tile & destroy
        callback => {
          this.mapSQL.findOne({where: entity}).then(data => {
            if (data) {
              data.destroy().then(() => callback())
            } else { callback() }
          })
        }
      // Finished
      ], err => {
        if (err) { reject(err) }
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
   * Finds all Tiles
   *
   * @param {Array<Tile>} [tiles] An array of Tiles
   * @param {Object} [options] Find Options
   * @param {number} [options.limit] Limit the results
   * @param {number} [options.offset = 0] Offset the results
   * @param {boolean} [options.buffer = true] Allow tile data buffer
   * @param {number} [options.queue = 5000] Creates multiple SQL connections based on queue amount
   * @returns {Promise<Tiles.Attributes[]>}
   * @example
   * const tiles = await findAll()
   * //=tiles
   */
  findAll (tiles = [], options = {}) {
    // Define options
    const limit = options.limit
    const offset = options.offset || 0
    const queue = options.queue || 5000
    const buffer = (options.buffer === undefined) ? true : options.buffer

    // Initialize Find Options
    const container = []
    const findOptions = {
      attributes: (buffer) ? ['tile_column', 'tile_row', 'zoom_level', 'tile_data'] : ['tile_column', 'tile_row', 'zoom_level'],
      limit: limit || queue,
      offset
    }
    // If tiles were given as input
    if (tiles.length) {
      const selection = tiles.map(tile => Object({tile_column: tile[0], tile_row: tile[1], zoom_level: tile[2]}))
      findOptions.where = {$or: selection}
    }
    return new Promise(resolve => {
      this.tables().then(() => {
        // Loop all tiles
        let loop = true
        while (loop) {
          this.tilesSQL.findAll(findOptions).then(findAll => {
            if (findAll.length === 0) {
              loop = false
              return
            }

            // Clean results - Remove any Sequelize objects
            for (const item of findAll) {
              const result = {
                tile_column: item.tile_column,
                tile_row: item.tile_row,
                zoom_level: item.zoom_level
              }
              if (buffer) { result.tile_data = item.tile_data }
              container.push(result)
            }
            if (limit) {
              loop = false
              return
            }
            findOptions.offset += queue
          })
        }
        return resolve(container)
      })
    })
  }

  /**
   * Finds all Tile unique hashes
   *
   * @param {Tile[]} [tiles] An array of Tiles
   * @param {Object} [options] Find Options
   * @param {number} [options.limit] Limit the results
   * @param {number} [options.offset = 0] Offset the results
   * @param {number} [options.queue = 5000] Creates multiple SQL connections based on queue amount
   * @returns {Promise<number[]>} Unique tile hashes
   * @example
   * const hashes = await findAllId()
   * //=hashes
   */
  findAllId (tiles, options = {}) {
    options.buffer = false
    return new Promise(resolve => {
      this.findAll(tiles, options).then(findAll => {
        return resolve(findAll.map(tile => mercator.hash([tile.tile_column, tile.tile_row, tile.zoom_level])))
      })
    })
  }

  /**
   * Finds one Tile and returns Buffer
   *
   * @param {Tile} tile Tile [x, y, z]
   * @return {Promise<Buffer>} Tile Data
   * @example
   * const tile = await mbtiles.findOne([x, y, z])
   * //=tile
   */
  findOne (tile) {
    const [x, y, z] = tile
    const find = {
      attributes: ['tile_data'],
      where: {
        tile_column: x,
        tile_row: y,
        zoom_level: z
      }
    }

    return new Promise(resolve => {
      this.tables().then(() => {
        this.tilesSQL.find(find).then(data => {
          if (!data) { return resolve(undefined) }
          return resolve(data.tile_data)
        })
      })
    })
  }

  /**
   * Build SQL tables
   *
   * @returns {Promise}
   * @example
   * mbtiles.tables()
   *   .then(() => console.log('done'))
   */
  tables () {
    return new Promise(resolve => {
      this.db.serialize(() => {
        this.db.run(schema.TABLE.metadata)
        this.db.run(schema.TABLE.tiles, () => {
          return resolve()
        })
      })
    })
  }

  /**
   * Build SQL index
   *
   * @returns {Promise}
   * @example
   * mbtiles.index()
   *   .then(() => console.log('done'))
   */
  index () {
    return new Promise(resolve => {
      this.db.serialize(() => {
        this.db.run(schema.INDEX.metadata, () => {
          return resolve()
        })
      })
    })
  }
}
