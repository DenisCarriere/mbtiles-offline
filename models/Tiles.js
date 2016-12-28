"use strict";
const sequelize_offline_1 = require("sequelize-offline");
exports.scheme = {
    tile_column: { type: sequelize_offline_1.INTEGER, validate: { isInt: true } },
    tile_data: { type: sequelize_offline_1.BLOB },
    tile_row: { type: sequelize_offline_1.INTEGER, validate: { isInt: true } },
    zoom_level: { type: sequelize_offline_1.INTEGER, validate: { isInt: true } },
};
