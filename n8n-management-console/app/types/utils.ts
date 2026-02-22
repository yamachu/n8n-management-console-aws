export type KeyOmit<T, K extends keyof T> = Omit<T, K>;

export type Mutable<T, K extends keyof T> = Readonly<KeyOmit<T, K>> & {
  -readonly [U in K]: T[U];
};
