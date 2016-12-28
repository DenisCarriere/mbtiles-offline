import * as fs from 'fs'
import * as Sequelize from 'sequelize-offline'
import { Metadata } from '../'
import * as models from '../models'

/**
 * Get all files that match regex
 *
 * @param {string} path
 * @param {string} regex
 * @returns {Array<string>} matching files
 * getFiles('/home/myfiles')
 * //=['map', 'test']
 */
export function getFiles(path: string, regex = /\.mbtiles$/): Array<string> {
  let mbtiles = fs.readdirSync(path).filter(value => value.match(regex))
  mbtiles = mbtiles.map(data => data.replace(regex, ''))
  mbtiles = mbtiles.filter(name => !name.match(/^_.*/))
  return mbtiles
}

/**
 * Connect to SQL MBTiles DB
 *
 * @param {string} uri
 * @returns {Sequelize} Sequelize connection
 */
export function connect(uri: string): Sequelize.Sequelize {
  const options = {
    define: { freezeTableName: true, timestamps: false },
    logging: false,
    pool: { idle: 10000, max: 5, min: 0 },
    storage: uri,
  }
  return new Sequelize(`sqlite://${ uri }`, options)
}

/**
 * Parse Metadata
 * @param {Array<Metadata.Instance>} data
 * @returns Metadata
 */
export function parseMetadata(data: Array<models.Metadata.Instance>): Metadata {
  const metadata: Metadata = {}
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
      case 'format':
        switch (value) {
          case 'png':
          case 'jpg':
            metadata[name] = value
            break
          default:
        }
      case 'version':
        switch (value) {
          case '1.0.0':
          case '1.1.0':
          case '1.2.0':
            metadata[name] = value
            break
          default:
        }
      default:
    }
  })
  return metadata
}