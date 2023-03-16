import { ConfigValueType, SupportedValueTypes, IConfig, IConfigUserOptions, IConfigCollectionOption } from './types'

export class ConfigCollection {
  private readonly option: IConfigCollectionOption
  private readonly configs: IConfig[]

  public constructor (params?: Partial<IConfigCollectionOption>) {
    this.option = {
      ensureUpperCaseNames: params?.ensureUpperCaseNames ?? false
    }

    this.configs = []
  }

  public include (name: string, type: ConfigValueType, option?: Partial<IConfigUserOptions>): this {
    const { fallback, items } = option ?? {}

    name = name.trim()
    if (name.length === 0) {
      throw new Error('the config must have a non-empty name')
    }

    if (this.option.ensureUpperCaseNames) {
      if (name !== name.toUpperCase()) {
        throw new Error(`the config "${name}" must have an uppercased name`)
      }
    }

    if (type !== ConfigValueType.Enum && Array.isArray(items)) {
      throw new Error(`parameter "option.items" on config "${name}" is only allowed when type is "enum"`)
    }

    const isRequired = typeof fallback === 'undefined'

    this.configs.push({
      name,
      type,
      option: {
        isRequired,
        fallback: isRequired ? this.getDefaultValue(type) : this.validateFallbackValueTypes(name, type, fallback),
        items: Array.isArray(items) ? items : []
      }
    })

    return this
  }

  public getConfigs (): IConfig[] {
    return this.configs
  }

  private validateFallbackValueTypes (name: string, type: ConfigValueType, fallback: SupportedValueTypes): SupportedValueTypes {
    switch (type) {
      case ConfigValueType.Text:
      case ConfigValueType.Enum:
        if (typeof fallback !== 'string') {
          throw new Error(`fallback of config "${name}" with type "${type}" must be a string`)
        }
        break

      case ConfigValueType.Number:
        if (typeof fallback !== 'number') {
          throw new Error(`fallback of config "${name}" with type "${type}" must be a number`)
        }
        break

      case ConfigValueType.Boolean:
        if (typeof fallback !== 'boolean') {
          throw new Error(`fallback of config "${name}" with type "${type}" must be a boolean`)
        }
        break

      case ConfigValueType.List:
        if (!Array.isArray(fallback)) {
          throw new Error(`fallback of config "${name}" with type "${type}" must be an array`)
        }

        if (fallback.some((item) => typeof item !== 'string')) {
          throw new Error(`fallback of config "${name}" with type "${type}" must be an array of strings`)
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
