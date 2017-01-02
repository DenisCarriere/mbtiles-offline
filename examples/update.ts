import { MBTiles } from '../'
import * as path from 'path'
import * as fs from 'fs'

async function main() {
    const mb = new MBTiles('test.mbtiles')
    mb.name = 'Foo'
    const image = fs.readFileSync(path.join(__dirname, 'fixtures', 'images', '0', '0', '0.png'))
    await mb.save([0, 0, 0], image)
    mb.bounds = [-110, 0, 120, 30]
    console.log(await mb.update({}))
}
main()
