import { printCoinblitzBanner } from './banner'
import { CONFIG, loadConfigSync, loadWalletsSync } from './persist'

export async function bootstrap() {
  process.stdin.setEncoding('utf-8')

  loadConfigSync()
  loadWalletsSync()

  if (CONFIG.banner !== false) {
    printCoinblitzBanner()
  }
}
