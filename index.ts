// NodeJS packages
// import * as fs from 'fs'
// import * as crypto from 'crypto'
// import * as zlib from 'zlib'
// import * as path from 'path'
// import * as url from 'url'
// import * as qs from 'querystring'

// External packages
import { queue } from 'd3-queue'
// import * as mercator from 'global-mercator'
// import * as sqlite3 from 'sqlite3-offline'
// import * as tiletype from 'tiletype'

import * as mercator from 'global-mercator'
import * as Sequelize from 'sequelize-offline'
import * as models from './models'
import { connect, parseMetadata } from './utils'

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
  }

  /**
   * Save tile MBTile
   *
   * @param {Tile} tile Tile [x, y, z]
   * @param {Buffer} tile_data Tile image
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.save([x, y, z], buffer)
   */
  public save(tile: Tile, tile_data: Buffer): Promise<boolean> {
    const tile_id = mercator.hash(tile)
    const [x, y, z] = tile
    const entity = {
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id,
    }
    return new Promise((resolve, reject) => {
      this.init().then(() => {
        queue(1)
          .defer(callback => this.imagesSQL.create({ tile_data, tile_id }).then(() => callback(null)))
          .defer(callback => this.mapSQL.create(entity).then(() => callback(null)))
          .await(() => resolve(true))
      })
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
  public metadata(): Promise<Metadata> {
    return new Promise((resolve, reject) => {
      this.metadataSQL.findAll().then(data => resolve(parseMetadata(data)))
    })
  }

  /**
   * Update Metadata
   *
   * @param {Metadata} metadata Metadata according to MBTiles 1.1+ spec
   * @returns {Promise<boolean>} true/false
   * @example
   * await mbtiles.update({name: 'foo', description: 'bar'})
   */
  public update(metadata: Metadata): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.metadataSQL.sync({ force: true }).then(() => {
        const q = queue()
        for (const name of Object.keys(metadata)) {
          let value = metadata[name]

          if (Array.isArray(value)) { value = value.join(',')
          } else { value = String(value) }

          q.defer(callback => this.metadataSQL.create({name, value}).then(() => callback(null)))
        }
        q.await(() => resolve(true))
      })
    })
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
  public tile(tile: Tile): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const [x, y, z] = tile
      this.tilesSQL.find({
        attributes: ['tile_data'],
        where: {
          tile_column: x,
          tile_row: y,
          zoom_level: z,
        },
      }).then(
        data => {
          if (!data) { return reject('Tile has no data') }
          return resolve(data.tile_data)
        }
      )
    })
  }

  /**
   * Initialize
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.init()
   */
  public init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      queue()
        .defer(callback => this.tables().then(() => callback(null)))
        .defer(callback => this.index().then(() => callback(null)))
        .await(() => resolve(true))
    })
  }

  /**
   * Build Tables
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.tables()
   */
  public tables(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      queue()
        .defer(callback => this.metadataSQL.sync().then(() => callback(null)))
        .defer(callback => this.imagesSQL.sync().then(() => callback(null)))
        .defer(callback => this.mapSQL.sync().then(() => callback(null)))
        .await(() => resolve(true))
    })
  }

  /**
   * Builds Index
   *
   * @returns {boolean} true/false
   * @example
   * await mbtiles.index()
   */
  public index(): Promise<boolean> {
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
    return new Promise((resolve, reject) => {
      const q = queue()
      this.tables().then(() => {
        for (const query of queries) {
          q.defer(callback => this.sequelize.query(query).then(() => callback(null)))
        }
        q.await(() => resolve(true))
      })
    })
  }
}
