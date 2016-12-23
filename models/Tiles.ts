import * as Sequelize from 'sequelize-offline'
import { BLOB, INTEGER, DefineAttributes } from 'sequelize-offline'

/**
 * Tiles Interface for MBTiles SQL Model
 */
export interface Attributes {
  tile_column: number,
  tile_row: number,
  tile_data?: Buffer,
  zoom_level: number,
}

/**
 * Tiles Instance for MBTiles SQL Model
 */
export interface Instance extends Sequelize.Instance<Attributes>, Attributes { }

/**
 * Tiles Model for MBTiles SQL Model
 */
export interface Model extends Sequelize.Model<Instance, Attributes> { }

export const scheme: DefineAttributes = {
  tile_column: { type: INTEGER },
  tile_data: { type: BLOB },
  tile_row: { type: INTEGER },
  zoom_level: { type: INTEGER },
}
