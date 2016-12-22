import * as Sequelize from 'sequelize-offline'
import { TEXT, DefineAttributes } from 'sequelize-offline'

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

/**
 * Metadata Scheme for MBTiles SQL Model
 */
export const scheme: DefineAttributes = {
  name: { primaryKey: true, type: TEXT, unique: true },
  value: { allowNull: false, type: TEXT },
}
