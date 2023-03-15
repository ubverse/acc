import { PartialDeep } from 'type-fest'
import { ConfigValueType, SupportedValueTypes, IConfig, IConfigOptions, IConfigCollectionOptions } from './types'

export class ConfigCollection {
  private readonly options: IConfigCollectionOptions
  private readonly configs: IConfig[]

  public constructor (params?: PartialDeep<IConfigCollectionOptions>) {
    this.options = {
      defaults: {
        required: params?.defaults?.required ?? true
      }
    }

    this.configs = []
  }

  /**
   * Auxiliary method that constructs an object that represents an
   * environment variable used by the system.
   * @param name    - The variable name.
   * @param type    - The variable data type.
   * @param options - Configuration options (optionality and the allowed items a value can have).
   * @returns an object that represents an environment variable.
   */
  public include (name: string, type: ConfigValueType, options?: Partial<IConfigOptions>): this {
    const { fallback, required, items } = options ?? {}

    if (type !== ConfigValueType.Enum && Array.isArray(items)) {
      throw new Error('parameter "items" is only allowed for type "enum"')
    }

    if (type === ConfigValueType.Enum && Array.isArray(items) && items.some((item) => typeof item !== 'string')) {
      throw new Error('parameter "items" must be an array of strings')
    }

    this.configs.push({
      name,
      type,
      options: {
        required: typeof required === 'boolean' ? required : this.options.defaults.required,
        fallback: typeof fallback === 'undefined' ? this.getDefaultValue(type) : this.validateFallbackValueTypes(type, fallback),
        items: Array.isArray(items) ? items : []
      }
    })

    return this
  }

  public getConfigs (): IConfig[] {
    return this.configs
  }

  private validateFallbackValueTypes (type: ConfigValueType, fallback: SupportedValueTypes): SupportedValueTypes {
    switch (type) {
      case ConfigValueType.Text:
      case ConfigValueType.Enum:
        if (typeof fallback !== 'string') {
          throw new Error(`fallback value for type "${type}" must be a string`)
        }
        break

      case ConfigValueType.Number:
        if (typeof fallback !== 'number') {
          throw new Error(`fallback value for type "${type}" must be a number`)
        }
        break

      case ConfigValueType.Boolean:
        if (typeof fallback !== 'boolean') {
          throw new Error(`fallback value for type "${type}" must be a boolean`)
        }
        break

      case ConfigValueType.List:
        if (!Array.isArray(fallback)) {
          throw new Error(`fallback value for type "${type}" must be an array`)
        }

        if (fallback.some((item) => typeof item !== 'string')) {
          throw new Error(`fallback value for type "${type}" must be an array of strings`)
        }
        break
    }

    return fallback
  }

  private getDefaultValue (type: ConfigValueType): SupportedValueTypes {
    switch (type) {
      case ConfigValueType.Text:
      case ConfigValueType.Enum:
        return ''

      case ConfigValueType.Number:
        return 0

      case ConfigValueType.Boolean:
        return false

      case ConfigValueType.List:
        return []
    }
  }
}
