export type CreateOptions<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type ChangeType<T, K extends keyof T, U> = {
  [P in keyof T]: P extends K ? U : T[P];
}
export type CreateOptionsWithChange<T, K extends keyof T, M extends keyof T, U> = CreateOptions<ChangeType<T, M, U>, K>
