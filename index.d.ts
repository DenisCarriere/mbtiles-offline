type Tile = MBTiles.Tile
type Metadata = MBTiles.Metadata

declare class MBTiles {
  constructor(uri: string)
  save(tile: Tile, image: Buffer): Promise<boolean>
  metadata(): Promise<Metadata>
  delete(tile: Tile): Promise<boolean>
  update(metadata: Metadata): Promise<Metadata>
  findOne(tile: Tile): Promise<Buffer>
  findAll(): Promise<Tile[]>
  tables(): Promise<boolean>
  count(): Promise<boolean>
  index(): Promise<boolean>
  hash(tile: Tile): number
  hashes(): Promise<MBTiles.Hashes>
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
