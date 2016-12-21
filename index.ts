// NodeJS packages
import * as fs from 'fs'
import * as crypto from 'crypto'
import * as zlib from 'zlib'
import * as path from 'path'
import * as url from 'url'
import * as qs from 'querystring'
import {Buffer} from 'buffer'

// External packages
import * as queue from 'd3-queue'
import * as mercator from 'global-mercator'
import * as sqlite3 from 'sqlite3-offline'
const tiletype = require('tiletype')

// Tile - z,x,y
type Tile = [number, number, number]

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
 * Connect to SQLite3 Database
 *
 * @param {string} uri
 * @returns {sqlite3.Database} database
 */
export function connect(uri: string): sqlite3.Database {
  return new sqlite3.Database(uri)
}

/**
 * Retrieve Buffer from Tile [x, y, z]
 */
function getTile(tile: Tile, area?: number): Promise<Buffer> {
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
 * MBTiles
 */
export class MBTiles {
  public uri: string
  private db: sqlite3.Database

  constructor(uri: string) {
    this.uri = uri
    this.db = connect(uri)
  }
}

const db = new MBTiles('test.mbtiles')
console.log(db)
