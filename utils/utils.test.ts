import * as path from 'path'
import { getFiles, parseMetadata } from './utils'

describe('Utils', () => {
  test('getFiles', () => {
    expect(getFiles(path.join(__dirname, '..', 'fixtures'))).toBeDefined()
  })

  test('parseMetadata', () => {
    expect(parseMetadata([{name: 'center', value: '110,30,800'}])).toEqual({center: [110, 30, 800]})
    expect(parseMetadata([{name: 'center', value: '110,30'}])).toEqual({center: [110, 30]})
    expect(parseMetadata([{name: 'type', value: 'baselayer'}])).toEqual({type: 'baselayer'})
    expect(parseMetadata([{name: 'name', value: 'foo'}])).toEqual({name: 'foo'})
    expect(parseMetadata([{name: 'bounds', value: '-110,-20,130,30'}])).toEqual({bounds: [-110, -20, 130, 30]})
    expect(parseMetadata([{name: 'format', value: 'png'}])).toEqual({format: 'png'})
    expect(parseMetadata([{name: 'version', value: '1.1.0'}])).toEqual({version: '1.1.0'})
    expect(parseMetadata([{name: 'minzoom', value: '10'}])).toEqual({minzoom: 10})
    expect(parseMetadata([{name: 'maxzoom', value: '18'}])).toEqual({maxzoom: 18})
  })
})
