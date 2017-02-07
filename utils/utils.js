const fs = require('fs')
const sqlite3 = require('sqlite3-offline')
const chalk = require('chalk')

/**
 * Pretty Error message
 */
module.exports.error = (message) => {
  throw new Error(chalk.bgRed.white(message))
}

/**
 * Pretty Warning message
 */
module.exports.warning = (message) => {
  console.log(chalk.bgYellow.black(message))
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
    data.map(item => {
      const name = item.name.toLowerCase()
      const value = item.value
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
              break
            default:
          }
          break
        case 'type':
          switch (value) {
            case 'overlay':
            case 'baselayer':
              metadata[name] = value
              break
            default:
          }
          break
        case 'format':
          switch (value) {
            case 'png':
            case 'jpg':
              metadata[name] = value
              break
            default:
          }
          break
        case 'version':
          switch (value) {
            case '1.0.0':
            case '1.1.0':
            case '1.2.0':
              metadata[name] = value
              break
            default:
          }
          break
        default:
          metadata[name] = value
      }
    })
  }
  return metadata
}