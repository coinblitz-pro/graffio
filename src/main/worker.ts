import { BigNumber } from '@ethersproject/bignumber'
import { AptosAccount, AptosClient } from 'aptos'
import { DRAW_FUNCTION } from '../system/constants'
import { CONFIG, WALLETS } from '../system/persist'
import { DrawArguments } from '../system/types'
import { lg, mix, random, sleep } from '../system/utils'
import { TxBuffer } from './buffer'

export async function worker() {
  const provider = new AptosClient(CONFIG.chain.rpc)
  const buffer = new TxBuffer(provider)

  for (const wallet of CONFIG.mixWallets ? mix(WALLETS) : WALLETS) {
    const payload = await buffer.get()
    const [ { inner }, _xs, _ys, _colors ] = payload.arguments as DrawArguments

    const slice = [ 1, random(1, _xs.length - 1) ]
    const shift = random(0, 7)

    const xs = _xs.slice(...slice)
    const ys = _ys.slice(...slice)
    const colors = _colors.match(/0\d/g).slice(...slice).map((c) => (parseInt(c) + shift) % 7)

    const tx = await submitTransaction(provider, wallet, { function: DRAW_FUNCTION, arguments: [ inner, xs, ys, colors ] })
    lg(`drawn by https://explorer.aptoslabs.com/txn/${tx.hash}?network=mainnet`)

    await sleep(random(...CONFIG.sleep.betweenWallet))
  }
}

async function submitTransaction(provider: AptosClient, wallet: AptosAccount, payload: any) {
  const options = await estimateAptosGas(provider, wallet, payload)
  const rawTransaction = await provider.generateTransaction(wallet.address(), payload, options)
  const signedTransaction = await provider.signTransaction(wallet, rawTransaction)
  return provider.submitTransaction(signedTransaction)
}

async function estimateAptosGas(provider: AptosClient, wallet: AptosAccount, payload: any) {
  const txnRequest = await provider.generateTransaction(wallet.address(), payload)

  const [ tx ] = await provider.simulateTransaction(wallet, txnRequest, {
    estimateGasUnitPrice: true,
    estimateMaxGasAmount: true,
    estimatePrioritizedGasUnitPrice: true,
  })

  return {
    max_gas_amount: BigNumber.from(tx.gas_used).mul(110).div(100).toString(),
    gas_unit_price: tx.gas_unit_price,
  }
}
