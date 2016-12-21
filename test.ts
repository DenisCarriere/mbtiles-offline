import * as mbtiles from './'

test('hash', () => expect(mbtiles.hash(4, 312, 480)).toBe(5728))
