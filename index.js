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

import * as mercator from 'global-mercator'
import * as Sequelize from 'sequelize-offline'
import * as models from './models'
import { connect, parseMetadata } from './utils'

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
  private _init: boolean = false
  private _index: boolean = false
  private _tables: boolean = false

  constructor(uri: string) {
    this.uri = uri
    this.sequelize = connect(uri)
    this.tilesSQL = this.sequelize.define<models.Tiles.Instance, models.Tiles.Attributes>('tiles', models.Tiles.scheme)
    this.metadataSQL = this.sequelize.define<models.Metadata.Instance, models.Metadata.Attributes>('metadata', models.Metadata.scheme)
    this.imagesSQL = this.sequelize.define<models.Images.Instance, models.Images.Attributes>('images', models.Images.scheme)
    this.mapSQL = this.sequelize.define<models.Map.Instance, models.Map.Attributes>('map', models.Map.scheme)
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
  public async save(tile: Tile, tile_data: Buffer): Promise<models.Images.Attributes> {
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
