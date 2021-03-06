# MBTiles Offline

[![Build Status](https://travis-ci.org/DenisCarriere/mbtiles-offline.svg?branch=master)](https://travis-ci.org/DenisCarriere/mbtiles-offline)
[![Coverage Status](https://coveralls.io/repos/github/DenisCarriere/mbtiles-offline/badge.svg?branch=master)](https://coveralls.io/github/DenisCarriere/mbtiles-offline?branch=master)
[![npm version](https://badge.fury.io/js/mbtiles-offline.svg)](https://badge.fury.io/js/mbtiles-offline)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DenisCarriere/mbtiles-offline/master/LICENSE)

<!-- Line Break -->

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> MBTiles binding for NodeJS 4+ using Callbacks and/or Promises.

## Install

```bash
$ npm install --save mbtiles-offline
```

## Usage

```javascript
const MBTiles = require('mbtiles-offline')
const db = new MBTiles('example.mbtiles')

db.metadata()
//= Promise{ JSON }

db.save([1, 2, 3], Buffer([0, 1]))
db.save([2, 2, 3], Buffer([3, 4]))

db.findOne([1, 2, 3])
//= Promise { <Buffer 00 01> }

db.findAll()
//= Promise{ [[1, 2, 3], [2, 2, 3]] }

db.count()
//= Promise { 2 }

db.delete([1, 2, 3])
db.delete([2, 2, 3])

db.count()
//= Promise { 0 }
```

## Features

| Name                      | Description                                      |
| ------------------------- | :----------------------------------------------- |
| [metadata](#metadata)     | Retrieve Metadata from MBTiles                   |
| [update](#update)         | Update Metadata                                  |
| [save](#save)             | Save buffer data to individual Tile              |
| [delete](#delete)         | Delete individual Tile                           |
| [count](#count)           | Count total tiles                                |
| [findOne](#findone)       | Finds one Tile and returns buffer                |
| [findAll](#findall)       | Finds all Tiles                                  |
| [tables](#tables)         | Build SQL Tables                                 |
| [index](#index)           | Build SQL Index                                  |
| [getMinZoom](#getminzoom) | Retrieves Minimum Zoom level                     |
| [getMaxZoom](#getmaxzoom) | Retrieves Maximum Zoom level                     |
| [getFormat](#getformat)   | Retrieves Image Format                           |
| [getBounds](#getbounds)   | Retrieves Bounds                                 |
| [validate](#getformat)    | Validate MBTiles according to the specifications |
| [hash](#hash)             | Creates hash from a single Tile                  |
| [hashes](#getformat)      | Creates a hash table for all tiles               |

## NodeJS Support

Windows, MacOSX, Linux & Electron

-   Node.js v8
-   Node.js v7
-   Node.js v6
-   Node.js v5
-   Node.js v4

## Schemas

### XYZ

Slippy Map is the most commonly used Tile schema for service maps as tiles, providers such as Google/ArcGIS & OpenStreetMap use this schema.

```javascript
const tile1 = [1, 2, 3]
const tile2 = [2, 2, 3]
const tile3 = [1, 3, 3]
const tile4 = [2, 3, 3]
const img = Buffer([0, 1])
const db = new MBTiles('xyz.mbtiles', 'xyz')

db.save(tile1, img)
db.save(tile1, img)
db.findOne(tile1)
//= Promise { <Buffer 00 01> }
db.findAll()
//= Promise{ [[1, 2, 3], [2, 2, 3]] }
```

### TMS

Tile Map Service is an OGC protocol for serving maps as tiles. MBTiles uses TMS as it's internal tile storage schema (TMS has an inverse Y compared to the XYZ schema).

```javascript
const tile1 = [1, 5, 3]
const tile2 = [2, 5, 3]
const tile3 = [1, 4, 3]
const tile4 = [2, 4, 3]
const img = Buffer([0, 1])
const db = new MBTiles('tms.mbtiles', 'tms')

db.save(tile1, img)
db.save(tile2, img)
db.findOne(tile1)
//= Promise { <Buffer 00 01> }
db.findAll()
//= Promise{ [[1, 5, 3], [2, 5, 3]] }
```

### Quadkey

[Bing Map Tile System](https://msdn.microsoft.com/en-us/library/bb259689.aspx), a quadkey is defined as a string which represent a Tile [x,y,z].

```javascript
const tile1 = '021'
const tile2 = '030'
const tile3 = '023'
const tile4 = '032'
const img = Buffer([0, 1])
const db = new MBTiles('quadkey.mbtiles', 'quadkey')

db.save(tile1, img)
db.save(tile2, img)
db.findOne(tile1)
//= Promise { <Buffer 00 01> }
db.findAll()
//= Promise { ['021', '030'] }
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### index

MBTiles

#### constructor

MBTiles

**Parameters**

-   `uri` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Path to MBTiles
-   `schema` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Tile schema ('xyz', 'tms', 'quadkey') (optional, default `'xyz'`)

**Examples**

```javascript
const db = new MBTiles('example.mbtiles')
//= mbtiles
```

Returns **MBTiles** MBTiles

#### save

Save buffer data to individual Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]
-   `image` **[Buffer](https://nodejs.org/api/buffer.html)** Tile image

**Examples**

```javascript
db.save([x, y, z], buffer).then(status => {
  //= status
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

#### metadata

Retrieves Metadata from MBTiles

**Examples**

```javascript
db.metadata().then(metadata => {
  //= metadata
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** Metadata as an Object

#### metadataSync

Sync: Retrieves Metadata from MBTiles

**Parameters**

-   `callback` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** a method that takes (error: {Error}, metadata: {Object})

**Examples**

```javascript
db.metadata((error, metadata) => {
  //= error
  //= metadata
})
```

Returns **void**

#### delete

Delete individual Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
db.delete([x, y, z]).then(status => {
  //= status
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

#### getMinZoom

Retrieves Minimum Zoom level

**Examples**

```javascript
db.getMinZoom().then(minZoom => {
  //= minZoom
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>**

#### getMaxZoom

Retrieves Maximum Zoom level

**Examples**

```javascript
db.getMaxZoom().then(maxZoom => {
  //= maxZoom
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>**

#### getFormat

Retrieves Image Format

**Examples**

```javascript
db.getFormat().then(format => {
  //= format
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Formats>**

#### getBounds

Retrieves Bounds

**Parameters**

-   `zoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Zoom level

**Examples**

```javascript
db.getBounds().then(bbox => {
  //= bbox
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;BBox>**

#### count

Count the amount of Tiles

**Parameters**

-   `tiles` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Tile>?** Only find given tiles

**Examples**

```javascript
db.count().then(count => {
  //= count
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>**

#### update

Update Metadata

**Parameters**

-   `metadata` **Metadata** Metadata according to MBTiles spec 1.1.0 (optional, default `{}`)
    -   `metadata.attribution` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Attribution
    -   `metadata.bounds` **BBox** BBox [west, south, east, north] or Polygon GeoJSON
    -   `metadata.center` **Center** Center [lng, lat] or [lng, lat, height]
    -   `metadata.description` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Description
    -   `metadata.format` **Formats** Format 'png' | 'jpg' | 'webp' | 'pbf'
    -   `metadata.minzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Minimum zoom level
    -   `metadata.maxzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Maximum zoom level
    -   `metadata.name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Name
    -   `metadata.url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** URL source or tile scheme
    -   `metadata.type` **Types** Type 'baselayer' | 'overlay' (optional, default `'baselayer'`)
    -   `metadata.version` **Versions** Version '1.0.0' | '1.1.0' | '1.2.0' (optional, default `'1.1.0'`)

**Examples**

```javascript
const options = {
  name: 'Foo',
  description: 'Bar',
  minzoom: 1,
  maxzoom: 3,
  format: 'png',
  bounds: [-110, -40, 95, 50]
}
db.update(options).then(metadata => {
  //= metadata
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** Metadata

#### validate

Validate MBTiles according to the specifications

**Examples**

```javascript
db.validate().then(status => {
  //= status
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

#### findAll

Finds all Tile unique hashes

**Parameters**

-   `tiles` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Tile>?** Only find given tiles (optional, default `[]`)

**Examples**

```javascript
const tile1 = [33, 40, 6]
const tile2 = [20, 50, 7]
db.findAll([tile1, tile2]).then(tiles => {
  //= tiles
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Tile>>** An array of Tiles [x, y, z]

#### findOneSync

Sync: Finds one Tile and returns Buffer

**Parameters**

-   `tile` **Tile** Tile [x, y, z]
-   `callback` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** a method that takes (image: {Buffer})

**Examples**

```javascript
db.findOneSync([x, y, z], (error, image) => {
  //= error
  //= image
})
```

Returns **void**

#### findOne

Finds one Tile and returns Buffer

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
db.findOne([x, y, z]).then(image => {
  //= image
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Buffer](https://nodejs.org/api/buffer.html)>** Tile Data

#### tables

Build SQL tables

**Examples**

```javascript
db.tables().then(status => {
  //= status
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

#### index

Build SQL index

**Examples**

```javascript
db.index().then(status => {
  //= status
}).catch(error => {
  //= error
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

#### hash

Creates hash from a single Tile

**Parameters**

-   `tile` **Tile**

**Examples**

```javascript
const hash = db.hash([5, 25, 12])
//= 16797721
```

Returns **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** hash

#### hashes

Creates a hash table for all tiles

**Parameters**

-   `tiles` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Tile>?** Only find given tiles

**Examples**

```javascript
await db.save([0, 0, 3], Buffer([0, 1]))
await db.save([0, 1, 3], Buffer([2, 3]))
db.hashes()
//= Promise { Set { 64, 65 } }
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>>** hashes
