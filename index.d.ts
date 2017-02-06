type Tile = MBTiles.Tile
type Metadata = MBTiles.Metadata

declare class MBTiles {
  constructor(uri: string)
  public save(tile: Tile, image: Buffer): Promise<boolean>
  public metadata(): Promise<Metadata>
  public delete(tile: Tile): Promise<boolean>
  public update(metadata: Metadata): Promise<Metadata>
  public findOne(tile: Tile): Promise<Buffer>
  public findAll(): Promise<Tile[]>
  public tables(): Promise<boolean>
  public count(): Promise<boolean>
  public index(): Promise<boolean>
}

declare namespace MBTiles {
  type Center = [number, number]
  type Tile = [number, number, number]
  type Bounds = [number, number, number, number]
  type Formats = 'png' | 'jpeg' | 'jpeg' | 'pbf'
  type Types = 'baselayer' | 'overlay'
  type Versions = '1.0.0' | '1.1.0' | '1.2.0'

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
