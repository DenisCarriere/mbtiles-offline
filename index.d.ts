/// <reference types="geojson" />

type Tile = MBTiles.Tile
type Metadata = MBTiles.Metadata
type UpdateMetadata = MBTiles.UpdateMetadata
type Bounds = MBTiles.Bounds
type BBox = MBTiles.BBox
type Center = MBTiles.Center
type Schema = 'xyz' | 'tms' | 'quadkey'

interface SchemaType {
  xyz: Tile
  tms: Tile
  quadkey: string
}

declare class MBTilesClass<T extends Tile | string> {
  type: string
  version: string
  name?: string
  minzoom?: number
  maxzoom?: number
  format?: string
  bounds?: BBox
  center?: Center
  description?: string
  attribution?: string
  url?: string

  constructor(uri: string, schema?: Schema)

  /**
   * Save buffer data to individual Tile
   */
  save(tile: T, image: Buffer): Promise<boolean>

  /**
   * Retrieves Metadata from MBTiles
   */
  metadata(): Promise<Metadata>

  /**
   * Delete individual Tile
   */
  delete(tile: T): Promise<boolean>

  /**
   * Count the amount of Tiles
   */
  count(tiles?: T[]): Promise<number>


  /**
   * Update Metadata
   */
  update(metadata: UpdateMetadata): Promise<Metadata>

  /**
   * Finds all Tile unique hashes
   */
  findAll(tiles?: T[]): Promise<T[]>

  /**
   * Finds one Tile and returns Buffer
   */
  findOne(tile: T): Promise<Buffer>

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
  hash(tile: T): number

  /**
   * Creates a hash table for all tiles
   */
  hashes(tiles?: T[]): Promise<MBTiles.Hashes>

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
  export type Hashes = Set<number>
  export type MBTilesStatic = MBTilesClass<Tile | string>
  export type MBTilesTile = MBTilesClass<Tile>
  export type MBTilesQuadkey = MBTilesClass<string>

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

interface MBTiles {
  new (uri: string, schema: 'quadkey'): MBTilesClass<string>;
  new (uri: string, schema?: 'xyz' | 'tms'): MBTilesClass<Tile>;
}

declare const MBTiles: MBTiles;
export = MBTiles
