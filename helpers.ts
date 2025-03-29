import { customAlphabet } from "nanoid"

const BASE62_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const nanoid16 = customAlphabet(BASE62_ALPHABET, 16)
const nanoid10 = customAlphabet(BASE62_ALPHABET, 10)

function toBase62(num: number, length: number): string {
  let result = ""
  const base = 62

  do {
    result = BASE62_ALPHABET[num % base] + result
    num = Math.floor(num / base)
  } while (num > 0)

  return result.padStart(length, "0").slice(-length)
}

type GenIdOptions = {
  date?: true | Date
  prefix?: string
}

export const genId = ({ date, prefix = "" }: GenIdOptions) => {
  let rawId
  if (!date) {
    rawId = nanoid16()
  } else {
    const d = date === true ? new Date() : date

    rawId = toBase62(Math.round(d.getTime() / 1000), 6) + nanoid10()
  }

  return prefix + rawId.match(/.{1,4}/g)?.join("-")
}

const normaliseIndex = (index: number, length: number) =>
  ((index % length) + length) % length

export const safeAccess = <T>(array: T[], index: number): T =>
  array[normaliseIndex(index, array.length)]
