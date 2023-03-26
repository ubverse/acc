import { ConfigCollection } from './collection'
import { IConfig, ConfigValueType, ConfigValueMap, SupportedValueTypes, Nullable } from './types'

export class AppConfigurationChecker {
  private readonly collection: IConfig[]
  private envs: ConfigValueMap

  public constructor (collection?: ConfigCollection) {
    this.collection = collection === undefined ? [] : collection.getConfigs()
    this.refresh()
  }

  public refresh (): this {
    this.envs = this.fetch()
    return this
  }

  public declare (name: string, value: SupportedValueTypes): this {
    if (this.envs[name] !== undefined || process.env[name] !== undefined) {
      throw new Error(`environment variable "${name}" already declared`)
    }

    this.envs[name] = value
    return this
  }

  public retrieve<T extends SupportedValueTypes = string>(name: string): T {
    if (this.envs[name] === undefined) {
      throw new Error(`unknown environment variable "${name}"`)
    }

    return this.envs[name] as T
  }

  public retrieveAll (): ConfigValueMap {
    return this.envs
  }

  public mergeConfigs (config: AppConfigurationChecker): this {
    this.envs = Object.assign({}, this.envs, config.retrieveAll())
    return this
  }

  private fetch (): ConfigValueMap {
    const values: ConfigValueMap = {}
    const missing: string[] = []

    for (const env of this.collection) {
      const value = process.env[env.name]

      if (value === undefined || value.length === 0) {
        if (env.option.isRequired) {
          missing.push(env.name)
        } else {
          values[env.name] = env.option.fallback
        }

        continue
      }

      const parsedEnv = this.parseData(env.type, value, env.option.items)
      if (parsedEnv === null) {
        throw new Error(`environment variable ${env.name} is not of type ${env.type}`)
      }

      values[env.name] = parsedEnv
    }

    if (missing.length > 0) {
      const quotedList = missing.map((m) => `"${m}"`).join(', ')
      throw new Error(`missing environment variables: ${quotedList}`)
    }

    return values
  }

  private parseData (type: ConfigValueType, data: string, items: Nullable<string[]>): Nullable<SupportedValueTypes> {
    switch (type) {
      case ConfigValueType.Text: {
        return data
      }

      case ConfigValueType.Number: {
        const n = Number(data)
        if (isNaN(n)) {
          return null
        }

        return n
      }

      case ConfigValueType.Boolean: {
        if (['true', 'yes', '1'].includes(data.toLowerCase())) {
          return true
        }

        if (['false', 'no', '0'].includes(data.toLowerCase())) {
          return false
        }

        return null
      }

      case ConfigValueType.List: {
        return data.split(',')
      }

      case ConfigValueType.Enum: {
        if (Array.isArray(items) && items.includes(data)) {
          return data
        }

        return null
      }
    }
  }
}
