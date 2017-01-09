// NodeJS packages
// import * as fs from 'fs'
// import * as crypto from 'crypto'
// import * as zlib from 'zlib'
// import * as url from 'url'
// import * as qs from 'querystring'
// import * as sqlite3 from 'sqlite3-offline'

import * as tiletype from '@mapbox/tiletype'
import * as mercator from 'global-mercator'
import * as Sequelize from 'sequelize-offline'
import * as models from './models'
import { connect, createFolder, parseMetadata } from './utils'

/**
 * Tile - [x, y, zoom]
 */
export type Tile = [number, number, number]

/**
 * BBox - [west, south, east, north]
 */
export type BBox = [number, number, number, number]

/**
 * LngLat - [longitude, latitude]
 */
export type LngLat = [number, number]

/**
 * LngLatZoom - [longitude, latitude, zoom]
 */
export type LngLatZoom = [number, number, number]

/**
 * Formats
 */
export type Formats = 'png' | 'jpg' | 'webp' | 'pbf'

/**
 * Types
 */
export type Types = 'baselayer' | 'overlay'

/**
 * Versions
 */
export type Versions = '1.0.0' | '1.1.0' | '1.2.0'

/**
 * Center
 */
export type Center = LngLat | LngLatZoom

/**
 * Attributes
 */
export type Attributes = 'tile_column' | 'tile_data' | 'tile_row' | 'zoom_level'

/**
 * Metadata
 */
export interface Metadata {
  attribution?: string
  bounds?: BBox
  center?: Center
  description?: string
  format?: Formats
  minzoom?: number
  maxzoom?: number
  name?: string
  type?: Types
  version?: Versions
  url?: string
  [key: string]: any
}

/**
 * Find Options
 */
interface FindOptions {
  buffer?: boolean
  queue?: number
  limit?: number
  offset?: number
}

/**
 * MBTiles
 */
export class MBTiles {
  public uri: string
  public name: string
  public description: string
  public format: Formats
  public version: Versions
  public bounds: BBox
  public center: Center
  public attribution: string
  public minzoom: number
  public maxzoom: number
  public url: string
  public type: Types
  private sequelize: Sequelize.Sequelize
  private tilesSQL: models.Tiles.Model
  private metadataSQL: models.Metadata.Model
  private imagesSQL: models.Images.Model
  private mapSQL: models.Map.Model
  private _tables = false
  private _init = false
  private _index = false

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
  constructor(uri: string, metadata: Metadata = {}) {
    this.uri = uri
    this.sequelize = connect(uri)
    this.tilesSQL = this.sequelize.define<models.Tiles.Instance, models.Tiles.Attributes>('tiles', models.Tiles.scheme)
    this.metadataSQL = this.sequelize.define<models.Metadata.Instance, models.Metadata.Attributes>('metadata', models.Metadata.scheme)
    this.imagesSQL = this.sequelize.define<models.Images.Instance, models.Images.Attributes>('images', models.Images.scheme)
    this.mapSQL = this.sequelize.define<models.Map.Instance, models.Map.Attributes>('map', models.Map.scheme)
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
   * @param {Buffer} tile_data Tile image
   * @param {boolean} [overwrite=true] Allow overwrite save operations
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.save([x, y, z], buffer)
   */
  public async save(tile: Tile, tile_data: Buffer, overwrite = true): Promise<boolean> {
    if (!this.format) { this.format = tiletype.type(tile_data) }
    if (!this._init) { await this.init() }

    const tile_id = mercator.hash(tile)
    const [x, y, z] = tile
    const entity = {
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id,
    }

    // Overwrite existing
    if (overwrite) {
      await this.delete(tile)
    }

    // Save Image
    await this.imagesSQL.create({ tile_data, tile_id })
    await this.mapSQL.create(entity)
    return true
  }

  /**
   * Retrieves Metadata from MBTiles
   *
   * @returns {Promise<Metadata>} Metadata as an Object
   * @example
   * const metadata = await mbtiles.metadata()
   * //=metadata
   */
  public async metadata(): Promise<Metadata> {
    if (!this._tables) { await this.tables() }

    const data = await this.metadataSQL.findAll()
    const metadata = parseMetadata(data)
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
    return metadata
  }

  /**
   * Delete individual Tile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.delete([x, y, z])
   */
  public async delete(tile: Tile): Promise<boolean> {
    if (!this._init) { await this.init() }
    const tile_id = mercator.hash(tile)
    const [x, y, z] = tile
    const entity = {
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id,
    }
    const image = await this.imagesSQL.findOne({where: {tile_id}})
    if (image) { await image.destroy() }
    const map = await this.mapSQL.findOne({where: entity})
    if (map) { await map.destroy() }
    return true
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
  public async count(tiles: Tile[] = []): Promise<number> {
    if (!this._init) { await this.init() }
    if (!tiles.length) { return await this.tilesSQL.count() }
    const findAll = await this.findAll(tiles, {buffer: false})
    return findAll.length
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
  public async update(metadata: Metadata = {}): Promise<Metadata> {
    await this.metadata()
    await this.metadataSQL.sync({ force: true })
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

    for (const name of Object.keys(metadata)) {
      let value = metadata[name]

      if (Array.isArray(value)) { value = value.join(',')
      } else { value = String(value) }

      await this.metadataSQL.create({name, value})
    }

    return await this.metadata()
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
  public async findAll(tiles: Tile[] = [], options: FindOptions = {}): Promise<models.Tiles.Attributes[]> {
    if (!this._tables) { await this.tables() }

    // Define options
    const limit = options.limit
    const offset = options.offset || 0
    const queue = options.queue || 5000
    const buffer = (options.buffer === undefined) ? true : options.buffer

    // Initialize Find Options
    const container: models.Tiles.Attributes[] = []
    const findOptions: Sequelize.FindOptions = {
      attributes: (buffer) ? ['tile_column', 'tile_row', 'zoom_level', 'tile_data'] : ['tile_column', 'tile_row', 'zoom_level'],
      limit: (limit) ? limit : queue,
      offset,
    }

    // If tiles were given as input
    if (tiles.length) {
      const selection = tiles.map(tile => Object({tile_column: tile[0], tile_row: tile[1], zoom_level: tile[2]}))
      findOptions.where = {$or: selection}
    }

    // Loop all tiles
    while (true) {
      const findAll = await this.tilesSQL.findAll(findOptions)
      if (findAll.length === 0) { break }

      // Clean results - Remove any Sequelize objects
      for (const item of findAll) {
        const result: models.Tiles.Attributes = {
          tile_column: item.tile_column,
          tile_row: item.tile_row,
          zoom_level: item.zoom_level,
        }
        if (buffer) { result.tile_data = item.tile_data }
        container.push(result)
      }
      if (limit) { break }
      findOptions.offset += queue
    }
    return container
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
  public async findAllId(tiles?: Tile[], options: FindOptions = {}): Promise<number[]> {
    options.buffer = false
    const findAll = await this.findAll(tiles, options)
    return findAll.map(tile => mercator.hash([tile.tile_column, tile.tile_row, tile.zoom_level]))
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
  public async findOne(tile: Tile): Promise<Buffer> {
    if (!this._tables) { await this.tables() }

    const [x, y, z] = tile
    const data = await this.tilesSQL.find({
      attributes: ['tile_data'],
      where: {
        tile_column: x,
        tile_row: y,
        zoom_level: z,
      },
    })
    if (!data) { return undefined }
    return data.tile_data
  }

  /**
   * Initialize MBTiles
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.init()
   */
  public async init(): Promise<boolean> {
    await createFolder(this.uri)
    await this.tables()
    try { await this.index() } catch (e) { console.warn(e) }
    await this.update()
    this._init = true
    return true
  }

  /**
   * Build SQL tables
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.tables()
   */
  public async tables(): Promise<boolean> {
    await this.metadataSQL.sync()
    await this.imagesSQL.sync()
    await this.mapSQL.sync()
    this._tables = true
    return true
  }

  /**
   * Build SQL index
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.index()
   */
  public async index(): Promise<boolean> {
    if (!this._tables) { await this.tables() }
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
      JOIN images ON images.tile_id = map.tile_id`,
    ]
    for (const query of queries) {
      await this.sequelize.query(query)
    }
    this._index = true
    return true
  }
}
