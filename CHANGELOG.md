
# Changelog

## 2.8.0 - 2017-04-04

- Switch to `debug` instead of `console.log`

## 2.7.0 - 2017-3-24

- Use `jpeg` in metadata instead of `jpg` (bug in GeoServer, cannot be detected as valid MBTiles)

## 2.5.0 - 2017-3-16

- Add `bbox-dateline` to support malformed bbox extents (+/-180 longitudes "Fiji extent")

## 2.4.0 - 2017-2-25

- Test for corrupt MBTiles
- Add more error detection
- Remove undefined, blank & null values from metadata() & update()

## 2.3.0 - 2017-2-22

- Update `bounds` Typescript definition
- Drop `extent` input, now `bounds` can handle BBox|BBox[]|GeoJSON

## 2.2.0 - 2017-2-20

- Allow multiple extent inputs (BBox & BBox[] & GeoJSON)

## 2.1.0 - 2017-2-17

- Update SQLite3-offline dependency
- Add validation method `validate()`
- Auto detect Image format (png/jpg) `format()`
- Auto detect min & max zoom level `getMinZoom()` & `getMaxZoom()`
- Auto detect bounding box `getBounds(zoom)`

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
