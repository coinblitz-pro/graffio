import { AptosClient } from 'aptos'
import { DRAW_FUNCTION } from '../system/constants'
import { CONFIG } from '../system/persist'
import { DrawArguments } from '../system/types'
import { isEntryFunctionPayload, isUserTransaction, makeSpinner, random, sleep } from '../system/utils'

export class TxBuffer {
  protected buffer: any[] = []
  protected scanned = new Set<number>()

  constructor(protected provider: AptosClient) {}

  async get() {
    await this.load()
    return this.buffer.shift()
  }

  protected async load() {
    const left = 104575000
    const right = 104630000

    using spinner = makeSpinner(`scanning blockchain`).start()

    while (this.buffer.length <= CONFIG.buffer.limit) {
      const height = random(left, right)

      if (this.scanned.has(height)) {
        continue
      }

      this.scanned.add(height)
      if (this.scanned.size === right - left) {
        this.scanned.clear()
        this.buffer = []
        spinner.stop()
        await this.load()
        break
      } else {
        spinner.info(`: block ${height}, buffer ${this.buffer.length}`)
      }

      const block = await this.provider.getBlockByHeight(height, true)
      for (const transaction of block.transactions.filter(isUserTransaction)) {
        if (isEntryFunctionPayload(transaction.payload)) {
          if (transaction.payload.function === DRAW_FUNCTION) {
            const [ , xs, ys ] = transaction.payload.arguments as DrawArguments
            if (xs.length > 0 && ys.length > 0) {
              this.buffer.push(transaction.payload)
            }
          }
        }
      }

      await sleep(random(0.25, 0.5))
    }
  }
}
