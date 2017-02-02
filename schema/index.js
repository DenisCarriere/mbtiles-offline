const fs = require('fs')
const path = require('path')

/**
 * SQL Schema
 */
module.exports = {
  TABLE: {
    metadata: fs.readFileSync(path.join(__dirname, 'TABLE', 'metadata.sql'), 'utf8'),
    tiles: fs.readFileSync(path.join(__dirname, 'TABLE', 'tiles.sql'), 'utf8')
  },
  INDEX: {
    metadata: fs.readFileSync(path.join(__dirname, 'INDEX', 'metadata.sql'), 'utf8')
  }
}
