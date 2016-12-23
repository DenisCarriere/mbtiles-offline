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
import * as path from 'path'
import * as Sequelize from 'sequelize-offline'
import * as Tiles from './models/Tiles'
import * as Metadata from './models/Metadata'
import * as Images from './models/Images'
import * as Map from './models/Map'

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
 * Hash for Map ID
 *
 * @param {Tile} tile [x, y, z]
 * @returns {number} hash
 * @example
 * hash([312, 480, 4])
 * //=5728
 */
export function hash(tile: Tile): number {
  const [x, y, z] = tile
  return (1 << z) * ((1 << z) + x) + y
}

/**
 * Converts BBox to Center
 *
 * @param {BBox} bbox - [west, south, east, north] coordinates
 * @return {LngLat} center
 * @example
 * const center = bboxToCenter([90, -45, 85, -50])
 * //= [ 87.5, -47.5 ]
 */
export function bboxToCenter(bbox: BBox): LngLat {
  const [west, south, east, north] = bbox
  const lng = (west - east) / 2 + east
  const lat = (south - north) / 2 + north
  return [lng, lat]
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
 * Read Tile Data
 *
 * @param {TileInstance} data
 * @returns {Buffer} Tile Data
 */
function readTileData(data: Tiles.Instance): Buffer {
  if (!data) { throw new Error('Tile has no data') }
  return data.tile_data
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
        metadata[name] = value
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

  constructor(uri: string, metadata?: Metadata) {
    this.uri = uri
    this.sequelize = connect(uri)
    this.tilesSQL = this.sequelize.define<Tiles.Instance, Tiles.Attributes>('tiles', Tiles.scheme)
    this.metadataSQL = this.sequelize.define<Metadata.Instance, Metadata.Attributes>('metadata', Metadata.scheme)
    this.imagesSQL = this.sequelize.define<Images.Instance, Images.Attributes>('images', Images.scheme)
    this.mapSQL = this.sequelize.define<Map.Instance, Map.Attributes>('map', Map.scheme)

    if (metadata !== undefined) { this.update(metadata) }
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
    return readTileData(data)
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
    return true
  }

  /**
   * Update Metadata
   */
  public async update(metadata: Metadata): Promise<Metadata> {
    await this.index()
    await this.metadataSQL.sync({ force: true })
    for (const name of Object.keys(metadata)) {
      const value = metadata[name]
      await this.metadataSQL.create({name, value})
    }
    return metadata
  }

  /**
   * Retrieves Metadata from MBTiles
   */
  public async metadata(): Promise<Metadata> {
    const data = await this.metadataSQL.findAll()
    const metadata = parseMetadata(data)
    metadata.uri = this.uri
    metadata.basename = path.basename(this.uri)
    return metadata
  }

  /**
   * Save tile MBTile
   */
  public async save(tile: Tile, tile_data: Buffer): Promise<Images.Attributes> {
    await this.imagesSQL.sync()
    const tile_id = hash(tile)
    await this.imagesSQL.create({ tile_data, tile_id })
    return { tile_data, tile_id }
  }
}
