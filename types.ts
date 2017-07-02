import * as fs from 'fs'
import * as MBTiles from './'
import {Tile, Bounds} from './'

const image = fs.readFileSync('./in/images/0/0/0.png')
const tile: Tile = [0, 0, 0]
const bounds: Bounds = [-110, -40, 95, 50]
const options = {
    name: 'Foo',
    description: 'Bar',
    minzoom: 1,
    maxzoom: 3,
    format: 'png',
    bounds: bounds
}

// Default (TMS/XYZ Schema)
async function main() {
    const db = new MBTiles('./in/plain_1.mbtiles', 'tms')
    await db.metadata()
    await db.count()
    await db.tables()
    await db.findAll()
    await db.findOne(tile)
    await db.index()
    await db.save(tile, image)
    await db.update(options)
    await db.delete(tile)
    const tiles: Tile[] = await db.findAll()
    const hashes = await db.hashes()
    hashes.size
}

// Quadkey Schema
async function quadkey() {
    const db = new MBTiles('foo', 'quadkey')
    await db.findOne('1')
    await db.save('1', image)
    await db.update(options)
    await db.delete('1')
    const tiles: string[] = await db.findAll()
    const hashes = await db.hashes()
    hashes.size
}