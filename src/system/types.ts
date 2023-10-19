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
    limits: {
      soft: number
      hard: number
    }
  }
}

export type DrawArguments = [ { inner: string }, string[], string[], string ]
