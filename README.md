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

## Features

| Name                      | Description    |
|---------------------------|:---------------|
| [save](#save)             | Save buffer data to individual Tile
| [metadata](#metadata)     | Retrieve Metadata from MBTiles
| [delete](#delete)         | Delete individual Tile
| [update](#update)         | Update Metadata
| [get](#get)               | Get Buffer from Tile
| [init](#init)             | Initialize MBTiles
| [tables](#tables)         | Build SQL tables
| [index](#index)           | Build SQL index

# MBTiles

MBTiles

## constructor

MBTiles

**Parameters**

-   `uri` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Path to MBTiles
-   `metadata`   (optional, default `{}`)
    -   `metadata.bounds` **BBox** Bounds [west, south, east, north]
    -   `metadata.center` **Center** Center [lng, lat] or [lng, lat, height]
    -   `metadata.description` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Description
    -   `metadata.format` **Formats** Format 'png' | 'jpg' | 'webp' | 'pbf'
    -   `metadata.attribution` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Attribution
    -   `metadata.maxzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Maximum zoom level
    -   `metadata.name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Name
    -   `metadata.url` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** URL source or tile scheme
    -   `metadata.type` **\[Types]** Type 'baselayer' | 'overlay' (optional, default `'baselayer'`)
    -   `metadata.version` **\[Versions]** Version '1.0.0' | '1.1.0' | '1.2.0' (optional, default `'1.1.0'`)
    -   `metadata.minzoom` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Minimum zoom level

**Examples**

```javascript
import {MBTiles} from 'mbtiles-offline'
const mbtiles = MBTiles('example.mbtiles')
//=mbtiles
```

Returns **[MBTiles](#mbtiles)** MBTiles

## save

Save buffer data to individual Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]
-   `tile_data` **[Buffer](https://nodejs.org/api/buffer.html)** Tile image
-   `overwrite` **\[[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)]** Allow overwrite save operations (optional, default `true`)

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

## delete

Delete individual Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
await mbtiles.delete([x, y, z])
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** true/false

## update

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
const metadata = await mbtiles.update({name: 'foo', description: 'bar'})
//=metadata
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** Metadata

## get

Get Buffer from Tile

**Parameters**

-   `tile` **Tile** Tile [x, y, z]

**Examples**

```javascript
const tile = await mbtiles.get([x, y, z])
//=tile
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Buffer](https://nodejs.org/api/buffer.html)>** Tile Data

## init

Initialize MBTiles

**Examples**

```javascript
await mbtiles.init()
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true/false

## tables

Build SQL tables

**Examples**

```javascript
await mbtiles.tables()
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true/false

## index

Build SQL index

**Examples**

```javascript
await mbtiles.index()
```

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true/false

# Changelog

## 1.0.2 - 2017-1-1

- Handle metadata via class attributes
- Detect image type using tiletype

## 1.0.0 - 2016-12-30

- Initialize library
