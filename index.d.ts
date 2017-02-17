type Tile = MBTiles.Tile
type Metadata = MBTiles.Metadata

/**
 * MBTiles
 */
declare class MBTiles {
  name: string
  description: string
  minzoom?: number
  maxzoom?: number
  format?: string
  bounds?: MBTiles.Bounds
  type?: string
  version?: string
  center?: MBTiles.Center

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
  update(metadata: Metadata): Promise<Metadata>

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
  getBounds(zoom?: number): Promise<MBTiles.Bounds>

  /**
   * Validate MBTiles according to the specifications
   */
  validate(): Promise<boolean>
}

declare namespace MBTiles {
  type Center = [number, number]
  type Tile = [number, number, number]
  type Bounds = [number, number, number, number]
  type Formats = 'png' | 'jpeg' | 'jpeg' | 'pbf'
  type Types = 'baselayer' | 'overlay'
  type Versions = '1.0.0' | '1.1.0' | '1.2.0'

  interface Hashes {
    [key: number]: boolean
  }

  interface Metadata {
    name: string
    description: string
    minzoom?: number
    maxzoom?: number
    format?: string
    bounds?: Bounds
    type?: string
    version?: string
    center?: Center
  }
}
export = MBTiles
