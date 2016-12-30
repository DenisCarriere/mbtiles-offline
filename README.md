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

## init

Initialize

## tables

Build Tables

## index

Builds Index

Returns **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## getTile

Retrieve Buffer from Tile [x, y, z]

**Parameters**

-   `tile` **Tile** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Buffer](https://nodejs.org/api/buffer.html)>** Tile Data

## setMetadata

Set Metadata

**Parameters**

-   `metadata` **Metadata** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 

## getMetadata

Retrieves Metadata from MBTiles

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Metadata>** 

## save

Save tile MBTile

**Parameters**

-   `tile` **Tile** 
-   `tile_data` **[Buffer](https://nodejs.org/api/buffer.html)** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 

# Changelog

## 1.0.0 - 2016-12-30

- Initialize library
