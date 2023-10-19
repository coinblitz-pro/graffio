export type Config = {
  banner: boolean
  mixWallets: boolean
  chain: {
    rpc: string
  }
  sleep: {
    betweenTX: [ number, number ]
  }
  buffer: {
    limit: number
  }
  drawings: [ number, number ]
}

export type DrawArguments = [ { inner: string }, string[], string[], string ]
