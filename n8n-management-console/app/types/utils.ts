export type KeyOmit<T, K extends keyof T> = Omit<T, K>;

export type Mutable<T, K extends keyof T> = Readonly<KeyOmit<T, K>> & {
  -readonly [U in K]: T[U];
};

export type ValueReplace<
  T extends Record<string, any>,
  KV extends { [K in keyof T]?: any },
> = Omit<T, keyof KV> & {
  [K in keyof KV]: KV[K] extends undefined
    ? K extends keyof T
      ? T[K]
      : KV[K]
    : KV[K];
};
