# MBTiles Offline

[![Build Status](https://travis-ci.org/DenisCarriere/mbtiles-offline.svg?branch=master)](https://travis-ci.org/DenisCarriere/mbtiles-offline)
[![Circle CI](https://circleci.com/gh/DenisCarriere/mbtiles-offline.svg?style=svg)](https://circleci.com/gh/DenisCarriere/mbtiles-offline)
[![Coverage Status](https://coveralls.io/repos/github/DenisCarriere/mbtiles-offline/badge.svg?branch=master)](https://coveralls.io/github/DenisCarriere/mbtiles-offline?branch=master)
[![npm version](https://badge.fury.io/js/mbtiles-offline.svg)](https://badge.fury.io/js/mbtiles-offline)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DenisCarriere/mbtiles-offline/master/LICENSE)

This library is intented to be used in an offline environment with no dependencies which require the use of downloading a package from the internet.

## NodeJS Support

- ~~4.X~~
- ~~5.X~~
- 6.X
- 7.X

## Install

```bash
$ npm install --save mbtiles-offline
```

# MBTiles

MBTiles

## constructor

MBTiles

**Parameters**

-   `uri` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Path to MBTiles

**Examples**

```javascript
import {MBTiles} from 'mbtiles-offline'
const mbtiles = MBTiles('example.mbtiles')
//=mbtiles
```

Returns **[MBTiles](#mbtiles)** MBTiles

## save

Save tile MBTile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]
-   `tile_data` **[Buffer](https://nodejs.org/api/buffer.html)** Tile image

**Examples**

```javascript
await mbtiles.save([x, y, z], buffer)
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

## metadata

Retrieves Metadata from MBTiles

**Examples**

```javascript
const metadata = await mbtiles.metadata()
//=metadata
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** Metadata as an Object

## update

Update Metadata

**Parameters**

-   `metadata` **Metadata** Metadata according to MBTiles 1.1+ spec

**Examples**

```javascript
await mbtiles.update({name: 'foo', description: 'bar'})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

## tile

Retrieve Buffer from Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
const tile = await mbtiles.tile([x, y, z])
//=tile
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Buffer](https://nodejs.org/api/buffer.html)>** Tile Data

## init

Initialize

**Examples**

```javascript
await mbtiles.init()
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true/false

## tables

Build Tables

**Examples**

```javascript
await mbtiles.tables()
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true/false

## index

Builds Index

**Examples**

```javascript
await mbtiles.index()
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true/false

# Changelog

## 1.0.0 - 2016-12-30

- Initialize library