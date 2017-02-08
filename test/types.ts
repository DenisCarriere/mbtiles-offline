
import * as fs from 'fs'
import * as MBTiles from '../'

const tile: MBTiles.Tile = [0, 0, 0]
const image = fs.readFileSync('./in/images/0/0/0.png')
const bounds: MBTiles.Bounds = [-110, -40, 95, 50]
const options: MBTiles.Metadata = {
    name: 'Foo',
    description: 'Bar',
    minzoom: 1,
    maxzoom: 3,
    format: 'png',
    bounds: bounds
}

// Read
const mbtilesIn = new MBTiles('./in/plain_1.mbtiles')
mbtilesIn.metadata().then(function (data) { return console.log(data) })
mbtilesIn.count().then(function (data) { return console.log(data) })
mbtilesIn.tables().then(function (data) { return console.log(data) })
mbtilesIn.findAll().then(function (data) { return console.log(data) })
mbtilesIn.findOne(tile).then(function (data) { return console.log(data) })

// Save
const mbtilesOut = new MBTiles('./out/blank.mbtiles')
mbtilesOut.index().then(function (data) { return console.log(data) })
mbtilesOut.save(tile, image).then(function (status) { return console.log(status) })
mbtilesOut.update(options).then(function (data) { return console.log(data) })
mbtilesOut["delete"](tile).then(function (data) { return console.log(data) })
