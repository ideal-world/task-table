export type ChangeAllRequired<T> = Required<T>
export type ChangeAllOptional<T> = Partial<T>
export type ChangeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type ChangeRequiredExcept<T, K extends keyof T> = ChangeAllRequired<T> & Pick<T, K>
export type ChangeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type ChangeOptionalExcept<T, K extends keyof T> = ChangeAllOptional<T> & Pick<T, K>

export type ChangeType<T, K extends keyof T, U> = {
  [P in keyof T]: P extends K ? U : T[P]
}
export type ChangeTypes<T, U extends { [P in keyof T]?: any }> = {
  [P in keyof T]: P extends keyof U ? U[P] : T[P]
}
export type ChangeOptionalWithTypes<T, O extends keyof T, U extends { [P in keyof T]?: any }> = ChangeOptional<ChangeTypes<T, U>, O>
export type ChangeOptionalExceptWithTypes<T, O extends keyof T, U extends { [P in keyof T]?: any }> = ChangeOptionalExcept<ChangeTypes<T, U>, O>
