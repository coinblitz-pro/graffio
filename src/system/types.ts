export type Config = {
  banner: boolean
  mixWallets: boolean
  chain: {
    rpc: string
  }
  sleep: {
    betweenWallet: [ number, number ]
  }
  buffer: {
    limit: number
  }
}

export type DrawArguments = [ { inner: string }, string[], string[], string ]
