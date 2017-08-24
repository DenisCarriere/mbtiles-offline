const fs = require('fs')
const sqlite3 = require('sqlite3-offline')
const turfBBox = require('@turf/bbox')
const mercator = require('global-mercator')
const dateline = require('bbox-dateline')

/**
 * Get Tile Parser from schema
 * http://www.maptiler.org/google-maps-coordinates-tile-bounds-projection/
 *
 * @param {string} schema Tile schema
 * @return {[Function, Function]} Tile schema parsing functions [Schema to Tile, Tile to Schema]
 */
module.exports.getTileParser = (schema) => {
  if (!schema) throw new Error('schema is required')

  switch (schema.toLowerCase()) {
    case 'osm':
    case 'arcgis':
    case 'google':
    case 'xyz':
      return {schemaToTile: mercator.googleToTile, tileToSchema: mercator.tileToGoogle}
    case 'quadkey':
    case 'quadtree':
      return {schemaToTile: mercator.quadkeyToTile, tileToSchema: mercator.tileToQuadkey}
    case 'tms':
      return {schemaToTile: (tile) => tile, tileToSchema: (tile) => tile}
    default:
      throw new Error(schema + ' unknown Tile schema')
  }
}

/**
 * Get all files that match regex
 *
 * @param {string} path
 * @param {string} regex
 * @returns {string[]} matching files
 * getFiles('/home/myfiles')
 * //=['map', 'test']
 */
module.exports.getFiles = (path, regex = /\.mbtiles$/) => {
  let mbtiles = fs.readdirSync(path).filter(value => value.match(regex))
  mbtiles = mbtiles.map(data => data.replace(regex, ''))
  mbtiles = mbtiles.filter(name => !name.match(/^_.*/))
  return mbtiles
}

/**
 * Connect to SQL MBTiles DB
 *
 * @param {string} uri
 * @returns {Sqlite3} Sqlite3 connection
 */
module.exports.connect = (uri) => {
  return new sqlite3.Database(uri)
}

/**
 * Parse Metadata
 * @param {ParseMetadata[]} data
 * @returns Metadata
 */
module.exports.parseMetadata = (data) => {
  const metadata = {}
  if (data) {
    for (const item of data) {
      const name = item.name.toLowerCase()
      const value = item.value

      if (value === null || value === undefined || value === '') { continue }

      switch (name) {
        case 'minzoom':
        case 'maxzoom':
          metadata[name] = Number(value)
          break
        case 'name':
        case 'attribution':
        case 'description':
          metadata[name] = value
          break
        case 'bounds':
          const bounds = value.split(',').map(i => Number(i))
          metadata.bounds = [bounds[0], bounds[1], bounds[2], bounds[3]]
          break
        case 'center':
          const center = value.split(',').map(i => Number(i))
          switch (center.length) {
            case 2:
              metadata.center = [center[0], center[1]]
              break
            case 3:
              metadata.center = [center[0], center[1], center[2]]
          }
          break
        case 'type':
          switch (value) {
            case 'overlay':
            case 'baselayer':
              metadata[name] = value
          }
          break
        case 'format':
          switch (value.toLowerCase()) {
            case 'png':
              metadata[name] = value
              break
            case 'jpeg':
            case 'jpg':
              metadata[name] = 'jpeg'
          }
          break
        case 'version':
          switch (value) {
            case '1.0.0':
            case '1.1.0':
            case '1.2.0':
              metadata[name] = value
          }
          break
        default:
          metadata[name] = value
      }
    }
  }
  return metadata
}

/**
 * Parse Bounds - Retrieves maximum extent
 *
 * @param {BBox|BBox[]|GeoJSON.FeatureCollection|GeoJSON.Feature} extent
 * @returns BBox Maximum extent
 */
module.exports.parseBounds = (extent) => {
  // GeoJSON.FeatureCollection
  if (extent.type === 'FeatureCollection' || extent.type === 'Feature') {
    return dateline.bbox(turfBBox(extent))
  }
  return dateline.bbox(mercator.maxBBox(extent))
}
