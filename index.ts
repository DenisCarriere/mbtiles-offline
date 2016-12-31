// NodeJS packages
// import * as fs from 'fs'
// import * as crypto from 'crypto'
// import * as zlib from 'zlib'
// import * as url from 'url'
// import * as qs from 'querystring'
// import * as sqlite3 from 'sqlite3-offline'
// import * as tiletype from 'tiletype'

import * as mercator from 'global-mercator'
import * as Sequelize from 'sequelize-offline'
import * as models from './models'
import { connect, parseMetadata, createFolder } from './utils'


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
 * Metadata
 */
export interface Metadata {
  name?: string
  type?: 'baselayer' | 'overlay'
  version?: '1.0.0' | '1.1.0' | '1.2.0'
  attribution?: string
  description?: string
  bounds?: BBox
  center?: LngLat | LngLatZoom
  format?: 'png' | 'jpg'
  minzoom?: number
  maxzoom?: number
  [key: string]: any
}

/**
 * MBTiles
 */
export class MBTiles {
  public uri: string
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
 * @returns {MBTiles} MBTiles
 * @example
 * import {MBTiles} from 'mbtiles-offline'
 * const mbtiles = MBTiles('example.mbtiles')
 * //=mbtiles
 */
  constructor(uri: string) {
    this.uri = uri
    this.sequelize = connect(uri)
    this.tilesSQL = this.sequelize.define<models.Tiles.Instance, models.Tiles.Attributes>('tiles', models.Tiles.scheme)
    this.metadataSQL = this.sequelize.define<models.Metadata.Instance, models.Metadata.Attributes>('metadata', models.Metadata.scheme)
    this.imagesSQL = this.sequelize.define<models.Images.Instance, models.Images.Attributes>('images', models.Images.scheme)
    this.mapSQL = this.sequelize.define<models.Map.Instance, models.Map.Attributes>('map', models.Map.scheme)
    createFolder(uri)
  }

  /**
   * Save tile MBTile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @param {Buffer} tile_data Tile image
   * @param {boolean} overwrite Allow overwrite save operations
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.save([x, y, z], buffer)
   */
  public async save(tile: Tile, tile_data: Buffer, overwrite = false): Promise<boolean> {
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
      const exists = await this.imagesSQL.findOne({where: {tile_id}})
      if (exists) { await this.delete(tile) }
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
    const data = await this.metadataSQL.findAll()
    return parseMetadata(data)
  }

  /**
   * Delete Tile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.delete([x, y, z])
   */
  public async delete(tile: Tile): Promise<boolean> {
    const tile_id = mercator.hash(tile)
    const [x, y, z] = tile
    const entity = {
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id,
    }
    const image = await this.imagesSQL.findOne({where: {tile_id}})
    await image.destroy()
    const map = await this.mapSQL.findOne({where: entity})
    await map.destroy()
    return true
  }

  /**
   * Update Metadata
   *
   * @param {Metadata} metadata Metadata according to MBTiles 1.1+ spec
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.update({name: 'foo', description: 'bar'})
   */
  public async update(metadata: Metadata): Promise<boolean> {
    await this.metadataSQL.sync({ force: true })
    for (const name of Object.keys(metadata)) {
      let value = metadata[name]

      if (Array.isArray(value)) { value = value.join(',')
      } else { value = String(value) }

      await this.metadataSQL.create({name, value})
    }
    return true
  }

  /**
   * Retrieve Buffer from Tile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @return {Promise<Buffer>} Tile Data
   * @example
   * const tile = await mbtiles.tile([x, y, z])
   * //=tile
   */
  public async tile(tile: Tile): Promise<Buffer> {
    if (!this._init) { await this.init() }

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
   * Initialize
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.init()
   */
  public async init(): Promise<boolean> {
    await createFolder(this.uri)
    await this.tables()
    await this.index()
    this._init = true
    return true
  }

  /**
   * Build Tables
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
   * Builds Index
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.index()
   */
  public async index(): Promise<boolean> {
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
    await this.tables()
    for (const query of queries) {
      await this.sequelize.query(query)
    }
    this._index = true
    return true
  }
}
