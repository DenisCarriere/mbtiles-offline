const async = require('async')
const mercator = require('global-mercator')
const tiletype = require('@mapbox/tiletype')
const models = require('./models')
const utils = require('./utils')

// function asyncInit (callback) {
//   if (!this._init) {
//     this.init().then(data => callback())
//   } else { callback() }
// }

/**
 * MBTiles
 */
export class MBTiles {
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
   * import {MBTiles} from 'mbtiles-offline'
   * const mbtiles = MBTiles('example.mbtiles')
   * //=mbtiles
   */
  constructor (uri, metadata = {}) {
    this.uri = uri
    this.sequelize = utils.connect(uri)
    this.tilesSQL = this.sequelize.define('tiles', models.Tiles.scheme)
    this.metadataSQL = this.sequelize.define('metadata', models.Metadata.scheme)
    this.imagesSQL = this.sequelize.define('images', models.Images.scheme)
    this.mapSQL = this.sequelize.define('map', models.Map.scheme)
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
   * await mbtiles.save([x, y, z], buffer)
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
   * const metadata = await mbtiles.metadata()
   * //=metadata
   */
  metadata () {
    return new Promise((resolve, reject) => {
      async.waterfall([

        // Initialize database
        callback => {
          if (!this._init) {
            this.init().then(() => callback())
          } else { callback() }
        },

        // Retrieve Metadata data from Database
        callback => this.metadataSQL.findAll().then(data => callback(null, data)),

        // Parse metadata
        (data, callback) => {
          const metadata = utils.parseMetadata(data)
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
          callback(null, metadata)
        }
      // Finished
      ], (err, metadata) => {
        if (err) { return reject(err) }
        return resolve(metadata)
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
   * @param {Array<Tile>} [tiles=[]] Tiles
   * @returns {Promise<number>}
   * @example
   * const count = await mbtiles.count()
   * //=count
   */
  count (tiles = []) {
    return new Promise(resolve => {
      // Initialize
      this.init().then(() => {
        // If no lists given, count all
        if (!tiles.length) { this.tilesSQL.count().then(count => resolve(count)) }

        // Count all from list
        this.findAll(tiles, {buffer: false}).then(data => resolve(data.length))
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
   * const metadata = await mbtiles.update({name: 'foo', description: 'bar'})
   * //=metadata
   */
  update (metadata = {}) {
    return new Promise((resolve, reject) => {
      this.metadata().then(() => {
        this.metadataSQL.sync({ force: true }).then(() => {
          if (metadata.attribution === undefined && this.attribution) { metadata.attribution = this.attribution }
          if (metadata.bounds === undefined && this.bounds) { metadata.bounds = this.bounds }
          if (metadata.center === undefined && this.center) { metadata.center = this.center }
          if (metadata.description === undefined && this.description) { metadata.description = this.description }
          if (metadata.format === undefined && this.format) { metadata.format = this.format }
          if (metadata.maxzoom === undefined && this.maxzoom) { metadata.maxzoom = this.maxzoom }
          if (metadata.minzoom === undefined && this.minzoom) { metadata.minzoom = this.minzoom }
          if (metadata.name === undefined && this.name) { metadata.name = this.name }
          if (metadata.type === undefined && this.type) { metadata.type = this.type }
          if (metadata.version === undefined && this.version) { metadata.version = this.version }
          if (metadata.url === undefined && this.url) { metadata.url = this.url }

          // Parse center when bounds is available
          if (metadata.center === undefined && metadata.bounds) {
            metadata.center = mercator.bboxToCenter(metadata.bounds)
          }

          // Main attributes throw errors
          if (metadata.name === undefined) { throw new Error('Metadata <name> is required') }
          if (metadata.format === undefined) { throw new Error('Metadata <format> is required') }
          if (metadata.bounds === undefined) { throw new Error('Metadata <bounds> is required') }
          if (metadata.version === undefined) { throw new Error('Metadata <version> is required') }
          if (metadata.type === undefined) { throw new Error('Metadata <type> is required') }

          async.waterfall(
            Object.keys(metadata).map(name => {
              return callback => {
                let value = metadata[name]
                if (Array.isArray(value)) {
                  value = value.join(',')
                } else { value = String(value) }

                this.metadataSQL.create({name, value}).then(() => callback())
              }
            }),
            // Finished
            err => {
              if (err) { return reject(err) }
              return this.metadata.then(data => resolve(data))
            }
          )
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
   * Initialize MBTiles
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.init()
   */
  init () {
    this._init = true
    return new Promise(resolve => {
      utils.createFolder(this.uri).then(() => {
        this.tables().then(() => {
          this.index().then(() => {
            this.update().then(() => {
              resolve(true)
            })
          })
        })
      })
    })
  }

  /**
   * Build SQL tables
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.tables()
   */
  tables () {
    this._tables = true
    return new Promise(resolve => {
      this.metadataSQL.sync().then(() => {
        this.imagesSQL.sync().then(() => {
          this.mapSQL.sync().then(() => {
            resolve(true)
          })
        })
      })
    })
  }

  /**
   * Build SQL index
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.index()
   */
  index () {
    const queries = [
      'CREATE UNIQUE INDEX IF NOT EXISTS metadata_name on metadata (name)',
      'CREATE UNIQUE INDEX IF NOT EXISTS map_tile_id on map (tile_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS map_tile on map (tile_row, tile_column, zoom_level)',
      'CREATE UNIQUE INDEX IF NOT EXISTS images_tile_id on images (tile_id)',
      `CREATE VIEW IF NOT EXISTS tiles AS
      SELECT
        map.zoom_level AS zoom_level,
        map.tile_column AS tile_column,
        map.tile_row AS tile_row,
        images.tile_data AS tile_data
      FROM map
      JOIN images ON images.tile_id = map.tile_id`
    ]
    this._index = true
    return new Promise((resolve, reject) => {
      this.tables().then(() => {
        async.waterfall(queries.map(query => {
          return callback => this.sequelize.query(query).then(() => callback())
        }),
          err => {
            if (err) { return reject(err) }
            return resolve(true)
          }
        )
      })
    })
  }
}
