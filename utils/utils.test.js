import * as path from 'path'
import { getFiles } from './utils'

describe('Utils', () => {
  test('getFiles', () => {
    expect(getFiles(path.join(__dirname, '..', 'fixtures'))).toBeDefined()
  })
})
