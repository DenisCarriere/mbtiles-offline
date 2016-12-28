"use strict";
const sequelize_offline_1 = require("sequelize-offline");
exports.scheme = {
    tile_column: { type: sequelize_offline_1.INTEGER, validate: { isInt: true } },
    tile_id: { type: sequelize_offline_1.INTEGER, validate: { isInt: true }, primaryKey: true, unique: true },
    tile_row: { type: sequelize_offline_1.INTEGER, validate: { isInt: true } },
    zoom_level: { type: sequelize_offline_1.INTEGER, validate: { isInt: true } },
};
