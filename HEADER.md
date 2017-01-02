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
| [findOne](#findone)       | Finds one Tile and returns buffer
| [findAll](#findall)       | Finds all Tiles
| [findAllId](#findallid)   | Finds all Tile unique hashes
| [init](#init)             | Initialize MBTiles
| [tables](#tables)         | Build SQL tables
| [index](#index)           | Build SQL index

