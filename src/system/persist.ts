import { AptosAccount } from 'aptos'
import { existsSync, readFileSync } from 'fs'
import JSON5 from 'json5'
import { Config } from './types'

export let WALLETS: AptosAccount[] = []

export let CONFIG: Config = {
  banner: true,
  mixWallets: true,
  chain: {
    rpc: 'https://rpc.ankr.com/http/aptos/v1',
  },
  sleep: {
    betweenTX: [ 20, 40 ],
  },
  buffer: {
    limit: 32,
  },
  drawings: [ 1, 10 ],
}

export function loadFile(file: string) {
  return existsSync(file) ? readFileSync(file).toString().split('\n').filter(r => r).map(row => row.trim()) : []
}

export function loadWalletsSync() {
  WALLETS = loadFile('./data/keys.txt').map(privateKeyHex => AptosAccount.fromAptosAccountObject({ privateKeyHex }))
}

export function loadConfigSync() {
  CONFIG = existsSync('./data/config.json5')
    ? JSON5.parse<Config>(readFileSync('./data/config.json5').toString())
    : CONFIG
}
