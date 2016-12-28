"use strict";
const sequelize_offline_1 = require("sequelize-offline");
exports.scheme = {
    name: { type: sequelize_offline_1.TEXT, primaryKey: true, unique: true },
    value: { type: sequelize_offline_1.TEXT, allowNull: false },
};
