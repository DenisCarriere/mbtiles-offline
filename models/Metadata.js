const TEXT = require('sequelize-offline').TEXT

module.exports = {
  name: { type: TEXT, primaryKey: true, unique: true },
  value: { type: TEXT, allowNull: false }
}
