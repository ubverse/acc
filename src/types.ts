export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface IHash<T = any> {
  [key: string]: T
}

/**
 * Available data types for environment variables.
 *
 * - `Boolean` translates the string values "true" and "false" to their
 *   respective boolean values. String checking is case-insensitive.
 *
 * - `String` returns the variable value as is (the value is already a string)
 *
 * - `Number` translates a string made of numbers to a Number. Floating-point
 *   numbers could be parsed but the exact value will be lost due to "parseInt".
 *   This could be fixed/improved.
 *
 * - `List` translates a comma delimited string to an array of strings. E.g.:
 *   "a,b,c,d" will be parsed into "['a', 'b', 'c', 'd']".
 *
 * @enum {string}
 */
export enum ConfigValueType {
  Boolean = 'boolean',
  Enum = 'enum',
  List = 'list',
  Number = 'number',
  Text = 'text'
}

/* Supported environment variables types (as seem at @enum ConfigDataType). */
export type SupportedValueTypes = string | number | boolean | string[]

export interface IConfigOptions {
  readonly required: boolean
  readonly fallback: SupportedValueTypes
  readonly items: Nullable<string[]>
}

export interface IConfig {
  readonly name: string
  readonly type: ConfigValueType
  readonly options: IConfigOptions
}

export interface ConfigValueMap {
  [key: string]: SupportedValueTypes
}

export interface IConfigCollectionOptions {
  defaults: {
    required: boolean
  }
}
