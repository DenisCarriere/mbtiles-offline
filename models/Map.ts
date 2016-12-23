import * as Sequelize from 'sequelize-offline'
import { TEXT, INTEGER, DefineAttributes } from 'sequelize-offline'

/**
 * Map for MBTiles SQL Model
 */
export interface Attributes {
  tile_row: number
  tile_column: number
  tile_id?: string
  zoom_level: number
}

/**
 * Map Instance for MBTiles SQL Model
 */
export interface Instance extends Sequelize.Instance<Attributes>, Attributes { }

/**
 * Map Model for MBTiles SQL Model
 */
export interface Model extends Sequelize.Model<Instance, Attributes> { }

export const scheme: DefineAttributes = {
  tile_column: { type: INTEGER, validate: { isInt: true }},
  tile_id: { primaryKey: true, type: TEXT, unique: true },
  tile_row: { type: INTEGER, validate: { isInt: true }},
  zoom_level: { type: INTEGER, validate: { isInt: true }},
}
