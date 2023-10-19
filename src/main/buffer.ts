import { AptosClient } from 'aptos'
import { DRAW_FUNCTION } from '../system/constants'
import { CONFIG } from '../system/persist'
import { DrawArguments } from '../system/types'
import { isEntryFunctionPayload, isUserTransaction, makeSpinner, mix, random, sleep } from '../system/utils'

export class TxBuffer {
  protected buffer: any[] = []
  protected scanned = new Set<number>()
  protected limits = CONFIG.buffer.limits

  constructor(protected provider: AptosClient) {}

  async get() {
    await this.load()
    return this.buffer.shift()
  }

  protected async load() {
    if (this.buffer.length >= this.limits.soft) {
      return
    }

    const info = await this.provider.getLedgerInfo()
    const border = 103868316

    using _ = makeSpinner(`scanning blockchain`)

    for (let height = parseInt(info.block_height) - 32; height >= border; height--) {
      if (this.scanned.has(height)) {
        continue
      } else {
        this.scanned.add(height)
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

      if (this.buffer.length >= this.limits.hard) {
        break
      } else {
        await sleep(random(0.25, 0.5))
      }
    }

    if (this.scanned.has(border)) {
      this.scanned.clear()
      this.buffer = []
      await this.load()
    }

    this.buffer = mix(this.buffer)
  }
}
