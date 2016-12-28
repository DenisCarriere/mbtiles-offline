"use strict";
const sequelize_offline_1 = require("sequelize-offline");
exports.scheme = {
    tile_data: { type: sequelize_offline_1.BLOB },
    tile_id: { type: sequelize_offline_1.INTEGER, primaryKey: true, unique: true },
};
