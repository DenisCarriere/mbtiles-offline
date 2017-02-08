type Tile = MBTiles.Tile
type Metadata = MBTiles.Metadata

/**
 * MBTiles
 */
declare class MBTiles {
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
  count(tiles?: Tile[]): Promise<boolean>


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
    minzoom: number
    maxzoom: number
    format: string
    bounds: Bounds
    type?: string
    version?: string
    center?: Center
  }
}
export = MBTiles
