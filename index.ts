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
import Tiles, {
  TilesAttribute,
  TilesInstance,
  TilesModel } from './models/Tiles'
import Metadata, {
  MetadataAttribute,
  MetadataInstance,
  MetadataModel } from './models/Metadata'

/**
 * Tile - z,x,y
 */
type Tile = [number, number, number]

/**
 * Metadata
 */
export interface Metadata {
  name?: string
  type?: 'baselayer' | 'overlay'
  version?: '1.0.0' | '1.1.0' | '1.2.0'
  attribution?: string
  description?: string
  bounds?: [number, number, number, number]
  center?: [number, number] | [number, number, number]
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
 * @param {number} z Z tile
 * @param {number} x X tile
 * @param {number} y Y tile
 * @returns {number} hash
 * @example
 * hash(4, 312, 480)
 * //=5728
 */
export function hash(z: number, x: number, y: number): number {
  return (1 << z) * ((1 << z) + x) + y
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
function readTileData(data: TilesInstance): Buffer {
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

export function parseMetadata(data: Array<MetadataInstance>): Metadata {
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
  private tilesSQL: TilesModel
  private metadataSQL: MetadataModel

  constructor(uri: string) {
    this.uri = uri
    this.sequelize = connect(uri)
    this.tilesSQL = this.sequelize.define<TilesInstance, TilesAttribute>('tiles', Tiles)
    this.metadataSQL = this.sequelize.define<MetadataInstance, MetadataAttribute>('metadata', Metadata)
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
   * Retrieves Metadata from MBTiles
   */
  public async metadata() {
    const metadata = parseMetadata(await this.metadataSQL.findAll())
    metadata.uri = this.uri
    metadata.basename = path.basename(this.uri)
    return metadata
  }
}
