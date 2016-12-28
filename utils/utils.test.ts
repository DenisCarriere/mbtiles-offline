import * as path from 'path'
import { getFiles, parseMetadata } from './utils'

describe('Utils', () => {
  test('getFiles', () => {
    expect(getFiles(path.join(__dirname, '..', 'fixtures'))).toBeDefined()
  })

  test('parseMetadata', () => {
    expect(parseMetadata([{name: 'center', value: '110,30,800'}])).toEqual({center: [110, 30, 800]})
    expect(parseMetadata([{name: 'center', value: '110,30'}])).toEqual({center: [110, 30]})
  })
})
