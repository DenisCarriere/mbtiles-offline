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
  private _init: boolean
  private _index: boolean
  private _tables: boolean

  constructor(uri: string)
}