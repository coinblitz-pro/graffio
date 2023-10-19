import { worker } from './main/worker'
import { bootstrap } from './system/bootstrap'

async function main() {
  await bootstrap()
  await worker()
}

main()
