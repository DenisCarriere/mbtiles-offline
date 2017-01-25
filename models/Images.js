const INTEGER = require('sequelize-offline').INTEGER
const BLOB = require('sequelize-offline').BLOB

module.exports = {
  tile_data: { type: BLOB },
  tile_id: { type: INTEGER, primaryKey: true, unique: true }
}
