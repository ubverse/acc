import { ConfigCollection } from './collection'
import { ConfigValueType, IConfig, SupportedValueTypes } from './types'

describe('ConfigCollection | Allowed interactions', () => {
  it('should allow a text config to be included', () => {
    const configs = new ConfigCollection().include('REQUIRED_TEXT_CFG', ConfigValueType.Text).getConfigs()

    const textConf = {
      name: 'REQUIRED_TEXT_CFG',
      type: ConfigValueType.Text,
      option: {
        isRequired: true,
        fallback: '',
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(textConf)
  })

  it('should allow a number config to be included', () => {
    const configs = new ConfigCollection().include('REQUIRED_NUMBER_CFG', ConfigValueType.Number).getConfigs()

    const numberConf = {
      name: 'REQUIRED_NUMBER_CFG',
      type: ConfigValueType.Number,
      option: {
        isRequired: true,
        fallback: 0,
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(numberConf)
  })

  it('should allow a boolean config to be included', () => {
    const configs = new ConfigCollection().include('REQUIRED_BOOLEAN_CFG', ConfigValueType.Boolean).getConfigs()

    const booleanConf = {
      name: 'REQUIRED_BOOLEAN_CFG',
      type: ConfigValueType.Boolean,
      option: {
        isRequired: true,
        fallback: false,
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(booleanConf)
  })

  it('should allow a list config to be included', () => {
    const configs = new ConfigCollection().include('REQUIRED_LIST_CFG', ConfigValueType.List).getConfigs()

    const listConf = {
      name: 'REQUIRED_LIST_CFG',
      type: ConfigValueType.List,
      option: {
        isRequired: true,
        fallback: [],
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(listConf)
  })

  it('should allow an enum config to be included', () => {
    const configs = new ConfigCollection()
      .include('REQUIRED_ENUM_CFG', ConfigValueType.Enum, { items: ['a', 'b', 'c'] })
      .getConfigs()

    const enumConf = {
      name: 'REQUIRED_ENUM_CFG',
      type: ConfigValueType.Enum,
      option: {
        isRequired: true,
        fallback: '',
        items: ['a', 'b', 'c']
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(enumConf)
  })

  it('should allow a text config to be included with a custom fallback value', () => {
    const configs = new ConfigCollection()
      .include('OPTIONAL_TEXT_CFG', ConfigValueType.Text, { fallback: 'custom fallback' })
      .getConfigs()

    const textConf = {
      name: 'OPTIONAL_TEXT_CFG',
      type: ConfigValueType.Text,
      option: {
        isRequired: false,
        fallback: 'custom fallback',
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(textConf)
  })

  it('should allow a number config to be included with a custom fallback value', () => {
    const configs = new ConfigCollection().include('OPTIONAL_NUMBER_CFG', ConfigValueType.Number, { fallback: 123 }).getConfigs()

    const numberConf = {
      name: 'OPTIONAL_NUMBER_CFG',
      type: ConfigValueType.Number,
      option: {
        isRequired: false,
        fallback: 123,
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(numberConf)
  })

  it('should allow a boolean config to be included with a custom fallback value', () => {
    const configs = new ConfigCollection()
      .include('OPTIONAL_BOOLEAN_CFG', ConfigValueType.Boolean, { fallback: true })
      .getConfigs()

    const booleanConf = {
      name: 'OPTIONAL_BOOLEAN_CFG',
      type: ConfigValueType.Boolean,
      option: {
        isRequired: false,
        fallback: true,
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(booleanConf)
  })

  it('should allow a list config to be included with a custom fallback value', () => {
    const configs = new ConfigCollection()
      .include('OPTIONAL_LIST_CFG', ConfigValueType.List, { fallback: ['a', 'b'] })
      .getConfigs()

    const listConf = {
      name: 'OPTIONAL_LIST_CFG',
      type: ConfigValueType.List,
      option: {
        isRequired: false,
        fallback: ['a', 'b'],
        items: []
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(listConf)
  })

  it('should allow an enum config to be included with a custom fallback value', () => {
    const configs = new ConfigCollection()
      .include('OPTIONAL_ENUM_CFG', ConfigValueType.Enum, { fallback: 'b', items: ['a', 'b', 'c'] })
      .getConfigs()

    const enumConf = {
      name: 'OPTIONAL_ENUM_CFG',
      type: ConfigValueType.Enum,
      option: {
        isRequired: false,
        fallback: 'b',
        items: ['a', 'b', 'c']
      }
    }

    expect(configs).toHaveLength(1)
    expect(configs[0]).toStrictEqual(enumConf)
  })
})

describe('ConfigCollection | Validation and type errors', () => {
  it('should not allow a config with empty name', () => {
    const f = (name: string, type: ConfigValueType): IConfig[] => new ConfigCollection().include(name, type).getConfigs()

    const tests = [
      { name: '', type: ConfigValueType.Text },
      { name: ' ', type: ConfigValueType.Number },
      { name: '  ', type: ConfigValueType.Boolean },
      { name: '   ', type: ConfigValueType.List }
    ]

    for (const t of tests) {
      expect(() => f(t.name, t.type)).toThrowError('the config must have a non-empty name')
    }
  })

  it('should not allow "items" for non-enum types', () => {
    const f = (name: string, type: ConfigValueType): IConfig[] =>
      new ConfigCollection().include(name, type, { items: ['a', 'b', 'c'] }).getConfigs()

    const tests = [
      { name: 'TEXT_CFG', type: ConfigValueType.Text },
      { name: 'NUMBER_CFG', type: ConfigValueType.Number },
      { name: 'BOOLEAN_CFG', type: ConfigValueType.Boolean },
      { name: 'LIST_CFG', type: ConfigValueType.List }
    ]

    for (const t of tests) {
      expect(() => f(t.name, t.type)).toThrowError(
        `parameter "option.items" on config "${t.name}" is only allowed when type is "enum"`
      )
    }
  })

  it('should not allow a fallback value with a type that does not match the config type', () => {
    const f = (name: string, type: ConfigValueType, fallback: any): IConfig[] =>
      new ConfigCollection().include(name, type, { fallback }).getConfigs()

    const tests = [
      {
        name: 'TEXT_CFG',
        type: ConfigValueType.Text,
        fallback: 123,
        expectedFallbackType: 'a string'
      },
      {
        name: 'ENUM_CFG',
        type: ConfigValueType.Enum,
        fallback: 123,
        expectedFallbackType: 'a string'
      },
      {
        name: 'NUMBER_CFG',
        type: ConfigValueType.Number,
        fallback: 'abc',
        expectedFallbackType: 'a number'
      },
      {
        name: 'BOOLEAN_CFG',
        type: ConfigValueType.Boolean,
        fallback: 'abc',
        expectedFallbackType: 'a boolean'
      },
      {
        name: 'LIST_CFG',
        type: ConfigValueType.List,
        fallback: 'abc',
        expectedFallbackType: 'an array'
      },
      {
        name: 'LIST_CFG',
        type: ConfigValueType.List,
        fallback: [1, 2, 3],
        expectedFallbackType: 'an array of strings'
      }
    ]

    for (const t of tests) {
      expect(() => f(t.name, t.type, t.fallback)).toThrowError(
        `fallback of config "${t.name}" with type "${t.type}" must be ${t.expectedFallbackType}`
      )
    }
  })

  it('should not allow a lowercase config name when "ensureUpperCaseNames" is set', () => {
    const f = (name: string): IConfig[] =>
      new ConfigCollection({ ensureUpperCaseNames: true }).include(name, ConfigValueType.Text).getConfigs()

    const tests = [{ name: 'lowercase' }, { name: 'MixedCase' }, { name: 'Mixed_Case' }, { name: 'Mixed_Case_With_Numbers_123' }]

    for (const t of tests) {
      expect(() => f(t.name)).toThrowError(`the config "${t.name}" must have an uppercased name`)
    }
  })

  it('should not allow a non-required config to have a fallback value', () => {
    const f = (name: string, type: ConfigValueType, fallback: SupportedValueTypes): IConfig[] =>
      new ConfigCollection().include(name, type, { isRequired: false, fallback }).getConfigs()

    const tests = [
      { name: 'TEXT_CFG', type: ConfigValueType.Text, fallback: 'abc' },
      { name: 'ENUM_CFG', type: ConfigValueType.Enum, fallback: 'a' },
      { name: 'NUMBER_CFG', type: ConfigValueType.Number, fallback: 123 },
      { name: 'BOOLEAN_CFG', type: ConfigValueType.Boolean, fallback: true },
      { name: 'LIST_CFG', type: ConfigValueType.List, fallback: ['a', 'b', 'c'] }
    ]

    for (const t of tests) {
      expect(() => f(t.name, t.type, t.fallback)).toThrowError('fallback implies a required config')
    }
  })
})
