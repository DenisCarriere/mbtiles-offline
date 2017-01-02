import * as Sequelize from 'sequelize-offline'
import { DefineAttributes, TEXT } from 'sequelize-offline'

/**
 * Metadata Interface for MBTiles SQL Model
 */
export interface Attributes {
  name: string
  value: string
}

/**
 * Metadata Instance for MBTiles SQL Model
 */
export interface Instance extends Sequelize.Instance<Attributes>, Attributes { }

/**
 * Metadata Model for MBTiles SQL Model
 */
export interface Model extends Sequelize.Model<Instance, Attributes> { }

export const scheme: DefineAttributes = {
  name:  { type: TEXT, primaryKey: true, unique: true },
  value: { type: TEXT, allowNull: false },
}
