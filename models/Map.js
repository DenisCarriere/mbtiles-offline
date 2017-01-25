const INTEGER = require('sequelize-offline').INTEGER

module.exports = {
  tile_column: { type: INTEGER, validate: { isInt: true } },
  tile_id: { type: INTEGER, validate: { isInt: true }, primaryKey: true, unique: true },
  tile_row: { type: INTEGER, validate: { isInt: true } },
  zoom_level: { type: INTEGER, validate: { isInt: true } }
}
