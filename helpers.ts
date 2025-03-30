import { customAlphabet } from "nanoid"
import { CollectionId, DateArray, FieldId, ItemId, RawId } from "./app/types"

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

type GenIdOptions<P extends string = ""> = {
  date?: true | Date
  prefix: P
}

export const genId = <P extends string>({
  date,
  prefix,
}: GenIdOptions<P>): `${P}${RawId}` => {
  let rawId
  if (!date) {
    rawId = nanoid16()
  } else {
    const d = date === true ? new Date() : date
    rawId = toBase62(Math.round(d.getTime() / 1000), 6) + nanoid10()
  }

  const rawFormatted = rawId.match(/.{1,4}/g)?.join("-") as RawId
  return `${prefix}${rawFormatted}`
}

export const genCollectionId = (): CollectionId =>
  genId({ date: true, prefix: "c-" })

export const genFieldId = (): FieldId => genId({ date: true, prefix: "f-" })

export const genItemId = (): ItemId => genId({ date: true, prefix: "i-" })

const normaliseIndex = (index: number, length: number) =>
  ((index % length) + length) % length

export const safeAccess = <T>(array: T[], index: number): T =>
  array[normaliseIndex(index, array.length)]

export function dateToDateArray(date: Date): DateArray {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

export function dateArrayToUTCDate([y, m, d]: DateArray): Date {
  return new Date(Date.UTC(y, m - 1, d))
}
