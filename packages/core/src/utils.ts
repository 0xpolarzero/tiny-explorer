export type BigIntToString<T> = T extends bigint
  ? string
  : T extends Array<infer U>
    ? Array<BigIntToString<U>>
    : T extends object
      ? { [K in keyof T]: BigIntToString<T[K]> }
      : T;

export type StringToBigInt<T> = T extends string
  ? T extends `${infer N}n`
    ? N extends `${bigint}`
      ? bigint
      : T
    : T
  : T extends Array<infer U>
    ? Array<StringToBigInt<U>>
    : T extends object
      ? { [K in keyof T]: StringToBigInt<T[K]> }
      : T;

export const bigIntReplacer = <T>(value: T): BigIntToString<T> => {
  if (value === null || value === undefined) {
    return value as any;
  }

  if (typeof value === "bigint") {
    return `${value.toString()}n` as any;
  }

  if (Array.isArray(value)) {
    return value.map((item) => bigIntReplacer(item)) as any;
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, bigIntReplacer(v)])) as any;
  }

  return value as any;
};

export const bigIntReviver = <T>(value: T): StringToBigInt<T> => {
  if (value === null || value === undefined) {
    return value as any;
  }

  if (typeof value === "string" && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1)) as any;
  }

  if (Array.isArray(value)) {
    return value.map((item) => bigIntReviver(item)) as any;
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, bigIntReviver(v)])) as any;
  }

  return value as any;
};
