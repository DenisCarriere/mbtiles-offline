import * as path from 'path'
import * as fs from 'fs'
import { getFiles, parseMetadata, createFolder } from './utils'

describe('Utils', () => {
  test('getFiles', () => expect(getFiles(path.join(__dirname, '..', 'fixtures'))).toBeDefined())
  test('createFolder', () => createFolder('createFolderTest/test.mbtiles').then(() => expect(fs.existsSync('createFolderTest')).toBeTruthy()))
})

describe('Metadata', () => {
  test('center [x,y,z]', () => expect(parseMetadata([{name: 'center', value: '110,30,800'}])).toEqual({center: [110, 30, 800]}))
  test('center [x,y]', () => expect(parseMetadata([{name: 'center', value: '110,30'}])).toEqual({center: [110, 30]}))
  test('type', () => expect(parseMetadata([{name: 'type', value: 'baselayer'}])).toEqual({type: 'baselayer'}))
  test('name', () => expect(parseMetadata([{name: 'name', value: 'foo'}])).toEqual({name: 'foo'}))
  test('bounds', () => expect(parseMetadata([{name: 'bounds', value: '-110,-20,130,30'}])).toEqual({bounds: [-110, -20, 130, 30]}))
  test('format', () => expect(parseMetadata([{name: 'format', value: 'png'}])).toEqual({format: 'png'}))
  test('version', () => expect(parseMetadata([{name: 'version', value: '1.1.0'}])).toEqual({version: '1.1.0'}))
  test('minzoom', () => expect(parseMetadata([{name: 'minzoom', value: '10'}])).toEqual({minzoom: 10}))
  test('maxzoom', () => expect(parseMetadata([{name: 'maxzoom', value: '18'}])).toEqual({maxzoom: 18}))
})

afterAll(() => {
  fs.rmdirSync('createFolderTest/')
})
