
# Changelog

## 2.0.0 - 2017-2-2

- Update Typescript definitions
- Add tiles as param for count
- Add tiles index
- Add tiles @param to findAll & hashes
- Improve operations on blank mbtiles
- Add hashes to quickly build an index
- Removed Sequelize for SQLite3 (offline)
- Entire rewrite of methods:
  - metadata
  - count
  - update
  - tables
  - save

## 1.3.0 - 2017-1-25

- Overhaul module to be Standard JS
- Removed await by `async`

## 1.2.0 - 2017-1-9

- Add options to `findAll` (queue, limit, offset)

## 1.1.0 - 2017-1-2

- Fixed overwrite save function `Cannot read property 'destroy' of null`
- Added `count`, `findOne` & `findAll` functions

## 1.0.2 - 2017-1-1

- Handle metadata via class attributes
- Detect image type using tiletype

## 1.0.0 - 2016-12-30

- Initialize library
