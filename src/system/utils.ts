import dayjs from 'dayjs'

export function isEntryFunctionPayload(payload: any): payload is any {
  return payload?.type === 'entry_function_payload'
}

export function isUserTransaction(transaction: any): transaction is any {
  return transaction?.type === 'user_transaction'
}

export const makeSpinner = (message: string) => {
  let x = 0
  const chars = [ '⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉' ]

  const interval = setInterval(() => {
    process.stdout.write('\r' + message + chars[x++].padStart(3))
    x = x % chars.length
  }, 100)

  const stop = () => {
    if (interval !== undefined) {
      clearInterval(interval)
      process.stdout.write('\r'.padEnd(message.length + 10) + '\r')
    }
  }

  return { stop, [Symbol.dispose]: () => stop() }
}

export const sleep = async (time: number, withSpinner = true) => {
  using _ = withSpinner && time > 5 ? makeSpinner(`sleep for ${time}s`) : null
  await new Promise(resolve => setTimeout(resolve, time * 1000))
}

export const random = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min)) + min
}

export function mix<T extends any[]>(arr: Readonly<T>) {
  const mixed = [ ...arr ] as T
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ mixed[i], mixed[j] ] = [ mixed[j], mixed[i] ]
  }
  return mixed
}

export function lg(message: string, withTime = false) {
  console.log(withTime ? `  [${dayjs().format('DD.MM.YYYY hh:mm.ss')}] ${message}` : `  ${message}`)
}
