/// <reference types="geojson" />

type Tile = MBTiles.Tile
type Metadata = MBTiles.Metadata
type UpdateMetadata = MBTiles.UpdateMetadata
type Bounds = MBTiles.Bounds
type BBox = MBTiles.BBox
type Center = MBTiles.Center

/**
 * MBTiles
 */
declare class MBTiles {
  name: string
  description: string
  minzoom?: number
  maxzoom?: number
  format?: string
  bounds?: BBox
  type?: string
  version?: string
  center?: Center

  constructor(uri: string)

  /**
   * Save buffer data to individual Tile
   */
  save(tile: Tile, image: Buffer): Promise<boolean>

  /**
   * Retrieves Metadata from MBTiles
   */
  metadata(): Promise<Metadata>

  /**
   * Delete individual Tile
   */
  delete(tile: Tile): Promise<boolean>

  /**
   * Count the amount of Tiles
   */
  count(tiles?: Tile[]): Promise<number>


  /**
   * Update Metadata
   */
  update(metadata: UpdateMetadata): Promise<Metadata>

  /**
   * Finds all Tile unique hashes
   */
  findAll(tiles?: Tile[]): Promise<Tile[]>

  /**
   * Finds one Tile and returns Buffer
   */
  findOne(tile: Tile): Promise<Buffer>

  /**
   * Build SQL tables
   */
  tables(): Promise<boolean>

  /**
   * Build SQL index
   */
  index(): Promise<boolean>

  /**
   * Creates hash from a single Tile
   */
  hash(tile: Tile): number

  /**
   * Creates a hash table for all tiles
   */
  hashes(tiles?: Tile[]): Promise<MBTiles.Hashes>

  /**
   * Retrieves Minimum Zoom level
   */
  getMinZoom(): Promise<number>

  /**
   * Retrieves Maximum Zoom level
   */
  getMaxZoom(): Promise<number>

  /**
   * Retrieves Image Format
   */
  getFormat(): Promise<MBTiles.Formats>

  /**
   * Retrieves Bounds
   */
  getBounds(zoom?: number): Promise<MBTiles.BBox>

  /**
   * Validate MBTiles according to the specifications
   */
  validate(): Promise<boolean>
}

declare namespace MBTiles {
  export type Center = [number, number]
  export type Tile = [number, number, number]
  export type BBox = [number, number, number, number]
  export type Formats = 'png' | 'jpeg' | 'jpeg' | 'pbf'
  export type Types = 'baselayer' | 'overlay'
  export type Versions = '1.0.0' | '1.1.0' | '1.2.0'
  export type Polygon = GeoJSON.Feature<GeoJSON.Polygon>
  export type Polygons = GeoJSON.FeatureCollection<GeoJSON.Polygon>
  export type MultiPolygon = GeoJSON.Feature<GeoJSON.MultiPolygon>
  export type MultiPolygons = GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>
  export type Bounds = BBox | BBox[] | Polygon | Polygons | MultiPolygon | MultiPolygons

  export interface Hashes {
    [key: number]: boolean
  }

  export interface Metadata extends BaseMetadata {
    bounds?: BBox
  }

  export interface UpdateMetadata extends BaseMetadata {
    bounds?: Bounds
  }

  export interface BaseMetadata {
    name: string
    description: string
    minzoom?: number
    maxzoom?: number
    format?: string
    type?: string
    version?: string
    center?: Center
    attribution?: string
    url?: string
  }
}
export = MBTiles
