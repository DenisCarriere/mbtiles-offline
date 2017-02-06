# MBTiles Offline

[![Build Status](https://travis-ci.org/DenisCarriere/mbtiles-offline.svg?branch=master)](https://travis-ci.org/DenisCarriere/mbtiles-offline)
[![Coverage Status](https://coveralls.io/repos/github/DenisCarriere/mbtiles-offline/badge.svg?branch=master)](https://coveralls.io/github/DenisCarriere/mbtiles-offline?branch=master)
[![npm version](https://badge.fury.io/js/mbtiles-offline.svg)](https://badge.fury.io/js/mbtiles-offline)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DenisCarriere/mbtiles-offline/master/LICENSE)

<!-- Line Break -->
[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> This library is intented to be used in an offline environment with no dependencies which require the use of downloading a package from the internet.

## NodeJS Support

Windows, MacOSX, Linux & Electron

-   ~~4.X~~
-   ~~5.X~~
-   6.X
-   7.X

## Install

```bash
$ npm install --save mbtiles-offline
```

## Usage

```javascript
const MBTiles = require('mbtiles-offline')
const db = new MBTiles('example.mbtiles')
db.metadata()
    .then(metadata => console.log(metadata))
```

## Features

| Name                    | Description                         |
| ----------------------- | :---------------------------------- |
| [save](#save)           | Save buffer data to individual Tile |
| [metadata](#metadata)   | Retrieve Metadata from MBTiles      |
| [delete](#delete)       | Delete individual Tile              |
| [update](#update)       | Update Metadata                     |
| [findOne](#findone)     | Finds one Tile and returns buffer   |
| [findAll](#findall)     | Finds all Tiles                     |
| [findAllId](#findallid) | Finds all Tile unique hashes        |
| [tables](#tables)       | Build SQL Tables                    |
| [index](#index)         | Build SQL Index                     |

## API

### index

MBTiles

#### constructor

MBTiles

**Parameters**

-   `uri` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Path to MBTiles

**Examples**

```javascript
const mbtiles = new MBTiles('example.mbtiles')
//=mbtiles
```

Returns **MBTiles** MBTiles

#### save

Save buffer data to individual Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]
-   `image` **[Buffer](https://nodejs.org/api/buffer.html)** Tile image

**Examples**

```javascript
mbtiles.save([x, y, z], buffer)
  .then(() => console.log('done'))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 

#### metadata

Retrieves Metadata from MBTiles

**Examples**

```javascript
mbtiles.metadata()
  .then(metadata => console.log(metadata))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** Metadata as an Object

#### delete

Delete individual Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
mbtiles.delete([x, y, z])
  .then(() => console.log('done'))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 

#### count

Count the amount of Tiles

**Examples**

```javascript
mbtiles.count()
  .then(count => console.log(count))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>** 

#### update

Update Metadata

**Parameters**

-   `metadata` **\[Metadata]** Metadata according to MBTiles spec 1.1.0 (optional, default `{}`)
    -   `metadata.version` **\[Versions]** Version '1.0.0' | '1.1.0' | '1.2.0' (optional, default `'1.1.0'`)
    -   `metadata.bounds` **BBox** Bounds [west, south, east, north]
    -   `metadata.center` **Center** Center [lng, lat] or [lng, lat, height]
    -   `metadata.description` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Description
    -   `metadata.format` **Formats** Format 'png' | 'jpg' | 'webp' | 'pbf'
    -   `metadata.attribution` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Attribution
    -   `metadata.maxzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Maximum zoom level
    -   `metadata.name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Name
    -   `metadata.url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** URL source or tile scheme
    -   `metadata.type` **\[Types]** Type 'baselayer' | 'overlay' (optional, default `'baselayer'`)
    -   `metadata.minzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Minimum zoom level

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
mbtiles.update(options)
  .then(metadata => console.log(metadata))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** Metadata

#### findAll

Finds all Tile unique hashes

**Examples**

```javascript
const tiles = await findAllId()
//=tiles
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Tile>>** An array of Tiles [x, y, z]

#### findOne

Finds one Tile and returns Buffer

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
const tile = await mbtiles.findOne([x, y, z])
//=tile
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Buffer](https://nodejs.org/api/buffer.html)>** Tile Data

#### tables

Build SQL tables

**Examples**

```javascript
mbtiles.tables()
  .then(() => console.log('done'))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 

#### index

Build SQL index

**Examples**

```javascript
mbtiles.index()
  .then(() => console.log('done'))
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 
