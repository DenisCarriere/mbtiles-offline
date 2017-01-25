const BLOB = require('sequelize-offline').BLOB
const INTEGER = require('sequelize-offline').INTEGER

module.exports = {
  tile_column: { type: INTEGER, validate: { isInt: true } },
  tile_data: { type: BLOB },
  tile_row: { type: INTEGER, validate: { isInt: true } },
  zoom_level: { type: INTEGER, validate: { isInt: true } }
}
