// NodeJS packages
// import * as fs from 'fs'
// import * as crypto from 'crypto'
// import * as zlib from 'zlib'
// import * as path from 'path'
// import * as url from 'url'
// import * as qs from 'querystring'

// External packages
// import * as queue from 'd3-queue'
// import * as mercator from 'global-mercator'
// import * as sqlite3 from 'sqlite3-offline'
// import * as tiletype from 'tiletype'

import * as fs from 'fs'
import * as mercator from 'global-mercator'
import * as Sequelize from 'sequelize-offline'
import { Tiles, Metadata, Images, Map } from './models'

/**
 * Tile - [x, y, zoom]
 */
type Tile = [number, number, number]

/**
 * BBox - [west, south, east, north]
 */
type BBox = [number, number, number, number]

/**
 * LngLat - [longitude, latitude]
 */
type LngLat = [number, number]

/**
 * LngLatZoom - [longitude, latitude, zoom]
 */
type LngLatZoom = [number, number, number]

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
  minzoom?: number
  maxzoom?: number
  format?: 'png' | 'jpg'
  basename?: string
  uri?: string
  [key: string]: any
}

/**
 * Get all files that match regex
 *
 * @param {string} path
 * @param {string} regex
 * @returns {Array<string>} matching files
 * getFiles('/home/myfiles')
 * //=['map', 'test']
 */
export function getFiles(path: string, regex = /\.mbtiles$/): Array<string> {
  let mbtiles = fs.readdirSync(path).filter(value => value.match(regex))
  mbtiles = mbtiles.map(data => data.replace(regex, ''))
  mbtiles = mbtiles.filter(name => !name.match(/^_.*/))
  return mbtiles
}

/**
 * Connect to SQL MBTiles DB
 *
 * @param {string} uri
 * @returns {Sequelize} Sequelize connection
 */
export function connect(uri: string): Sequelize.Sequelize {
  const options = {
    define: { freezeTableName: true, timestamps: false },
    logging: false,
    pool: { idle: 10000, max: 5, min: 0 },
    storage: uri,
  }
  return new Sequelize(`sqlite://${ uri }`, options)
}

/**
 * Parse Metadata
 * @param {Array<Metadata.Instance>} data
 * @returns Metadata
 */
export function parseMetadata(data: Array<Metadata.Instance>): Metadata {
  const metadata: Metadata = {}
  data.map(item => {
    const name = item.name.toLowerCase()
    const value = item.value
    switch (name) {
      case 'minzoom':
      case 'maxzoom':
        metadata[name] = Number(value)
        break
      case 'name':
      case 'attribution':
      case 'description':
        metadata[name] = value
        break
      case 'bounds':
        const bounds = value.split(',').map(i => Number(i))
        metadata.bounds = [bounds[0], bounds[1], bounds[2], bounds[3]]
        break
      case 'center':
        const center = value.split(',').map(i => Number(i))
        switch (center.length) {
          case 2:
            metadata.center = [center[0], center[1]]
            break
          case 3:
            metadata.center = [center[0], center[1], center[2]]
            break
          default:
        }
        break
      case 'type':
        switch (value) {
          case 'overlay':
          case 'baselayer':
            metadata[name] = value
            break
          default:
        }
      case 'format':
        switch (value) {
          case 'png':
          case 'jpg':
            metadata[name] = value
            break
          default:
        }
      case 'version':
        switch (value) {
          case '1.0.0':
          case '1.1.0':
          case '1.2.0':
            metadata[name] = value
            break
          default:
        }
      default:
    }
  })
  return metadata
}

/**
 * MBTiles
 */
export class MBTiles {
  public uri: string
  private sequelize: Sequelize.Sequelize
  private tilesSQL: Tiles.Model
  private metadataSQL: Metadata.Model
  private imagesSQL: Images.Model
  private mapSQL: Map.Model
  private _init: boolean = false
  private _index: boolean = false
  private _tables: boolean = false

  constructor(uri: string) {
    this.uri = uri
    this.sequelize = connect(uri)
    this.tilesSQL = this.sequelize.define<Tiles.Instance, Tiles.Attributes>('tiles', Tiles.scheme)
    this.metadataSQL = this.sequelize.define<Metadata.Instance, Metadata.Attributes>('metadata', Metadata.scheme)
    this.imagesSQL = this.sequelize.define<Images.Instance, Images.Attributes>('images', Images.scheme)
    this.mapSQL = this.sequelize.define<Map.Instance, Map.Attributes>('map', Map.scheme)
  }

  /**
   * Initialize
   */
  public async init(): Promise<boolean> {
    await this.tables()
    await this.index()
    this._init = true
    return true
  }

  /**
   * Build Tables
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
   * @returns {boolean}
   */
  public async index(): Promise<boolean> {
    await this.mapSQL.sync()
    await this.imagesSQL.sync()
    await this.metadataSQL.sync()
    await this.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS metadata_name on metadata (name)')
    await this.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS map_tile_id on map (tile_id)')
    await this.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS map_tile on map (tile_row, tile_column, zoom_level)')
    await this.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS images_tile_id on images (tile_id)')
    await this.sequelize.query(`CREATE VIEW IF NOT EXISTS tiles AS
  SELECT
    map.zoom_level AS zoom_level,
    map.tile_column AS tile_column,
    map.tile_row AS tile_row,
    images.tile_data AS tile_data
  FROM map
  JOIN images ON images.tile_id = map.tile_id`)
    this._index = true
    return true
  }

  /**
   * Retrieve Buffer from Tile [x, y, z]
   *
   * @param {Tile} tile
   * @return {Promise<Buffer>} Tile Data
   */
  public async getTile(tile: Tile): Promise<Buffer> {
    const [x, y, z] = tile
    const data = await this.tilesSQL.find({
      attributes: ['tile_data'],
      where: {
        tile_column: x,
        tile_row: y,
        zoom_level: z,
      },
    })
    if (!data) { throw new Error('Tile has no data') }
    return data.tile_data
  }

  /**
   * Set Metadata
   */
  public async setMetadata(metadata: Metadata): Promise<Metadata> {
    await this.metadataSQL.sync({ force: true })
    for (const name of Object.keys(metadata)) {
      const value = String(metadata[name])
      await this.metadataSQL.create({name, value})
    }
    return metadata
  }

  /**
   * Retrieves Metadata from MBTiles
   */
  public async getMetadata(): Promise<Metadata> {
    const data = await this.metadataSQL.findAll()
    const metadata = parseMetadata(data)
    return metadata
  }

  /**
   * Save tile MBTile
   */
  public async save(tile: Tile, tile_data: Buffer): Promise<Images.Attributes> {
    if (!this._init) { await this.init() }

    const tile_id = mercator.hash(tile)
    const [x, y, z] = tile
    await this.imagesSQL.create({ tile_data, tile_id })
    await this.mapSQL.create({
      tile_column: x,
      tile_row: y,
      zoom_level: z,
      tile_id,
    })
    return { tile_data, tile_id }
  }
}
