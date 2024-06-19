/**
 * 将所有属性变为必填
 *
 * Change all properties to required
 */
export type ChangeAllRequired<T> = Required<T>

/**
 * 将所有属性变为可选
 *
 * Change all properties to optional
 */
export type ChangeAllOptional<T> = Partial<T>

/**
 * 将指定属性变为必填
 *
 * Change the specified properties to required
 */
export type ChangeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 将除指定属性外的所有属性变为必填
 *
 * Change all properties except the specified properties to required
 */
export type ChangeRequiredExcept<T, K extends keyof T> = ChangeAllRequired<T> & Pick<T, K>

/**
 * 将指定属性变为可选
 *
 * Change the specified properties to optional
 */
export type ChangeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 将除指定属性外的所有属性变为可选
 *
 * Change all properties except the specified properties to optional
 */
export type ChangeOptionalExcept<T, K extends keyof T> = ChangeAllOptional<T> & Pick<T, K>

/**
 * 变更指定属性的类型
 *
 * Change the type of the specified property
 */
export type ChangeType<T, K extends keyof T, U> = {
  [P in keyof T]: P extends K ? U : T[P]
}

/**
 * 变更指定属性集合的类型集合（可同时修改多个属性到不同的类型）
 *
 * Change the type collection of the specified property collection (multiple properties can be modified to different types at the same time)
 */
export type ChangeTypes<T, U extends { [P in keyof T]?: any }> = {
  [P in keyof T]: P extends keyof U ? U[P] : T[P]
}

/**
 * 变更指定属性的类型为可选，同时修改属性的类型
 *
 * Change the type of the specified property to optional, and change the type of the properties at the same time
 */
export type ChangeOptionalWithTypes<T, O extends keyof T, U extends { [P in keyof T]?: any }> = ChangeOptional<ChangeTypes<T, U>, O>

/**
 * 变更除指定属性外的所有属性的类型为可选，同时修改属性的类型
 *
 * Change the type of all properties except the specified properties to optional, and change the type of the properties at the same time
 */
export type ChangeOptionalExceptWithTypes<T, O extends keyof T, U extends { [P in keyof T]?: any }> = ChangeOptionalExcept<ChangeTypes<T, U>, O>
