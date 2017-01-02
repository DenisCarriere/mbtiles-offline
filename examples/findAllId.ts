import { MBTiles } from '../'

async function main() {
    const mb = new MBTiles('fixtures/calabogie-imagery.mbtiles')
    // console.log(await mb.findAllId([]))
    console.log(await mb.count())
}
main()
