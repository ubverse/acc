import { ConfigCollection } from './collection'
import { AppConfigurationChecker } from './config'
import { ConfigValueType as CVT, SupportedValueTypes, Nullable, IConfigOptions } from './types'

interface ITestCase {
  key: string
  value: string
  expected: Nullable<SupportedValueTypes>
  option?: Partial<IConfigOptions>
}

interface ITestCaseWithExpectedError extends ITestCase {
  expectedError: string
}

const OLD_ENV = process.env

describe('AppConfigurationChecker | Allowed interactions', () => {
  it('should allow a new instance without a collection', () => {
    expect(() => new AppConfigurationChecker()).not.toThrow()
    expect(new AppConfigurationChecker().retrieveAll()).toStrictEqual({})
  })

  it('should allow the declaration of a config', () => {
    const config = new AppConfigurationChecker()
      .declare('DECLARED_TEXT_CONFIG', 'abc')
      .declare('DECLARED_NUMBER_CONFIG', 123)
      .declare('DECLARED_BOOLEAN_CONFIG', true)
      .declare('DECLARED_LIST_CONFIG', ['a', 'b', 'c'])

    expect(Object.keys(config.retrieveAll())).toHaveLength(4)
    expect(config.retrieve('DECLARED_TEXT_CONFIG')).toStrictEqual('abc')
    expect(config.retrieve('DECLARED_NUMBER_CONFIG')).toStrictEqual(123)
    expect(config.retrieve('DECLARED_BOOLEAN_CONFIG')).toStrictEqual(true)
    expect(config.retrieve('DECLARED_LIST_CONFIG')).toStrictEqual(['a', 'b', 'c'])
  })

  it('should allow an instance be merged with another instance', () => {
    const config1 = new AppConfigurationChecker().declare('DECLARED_TEXT_CONFIG', 'abc')
    const config2 = new AppConfigurationChecker().declare('DECLARED_NUMBER_CONFIG', 123)

    const merged = config1.mergeConfigs(config2)

    expect(Object.keys(merged.retrieveAll())).toHaveLength(2)
    expect(merged.retrieve('DECLARED_TEXT_CONFIG')).toStrictEqual('abc')
    expect(merged.retrieve('DECLARED_NUMBER_CONFIG')).toStrictEqual(123)
  })
})

describe('AppConfigurationChecker | Successful parsing', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  const validateRetrieveAndExpectStrictEqual = (type: CVT, tests: ITestCase[]): void => {
    process.env = Object.assign({}, OLD_ENV, Object.fromEntries(tests.map((t) => [t.key, t.value])))

    for (const test of tests) {
      const collection = new ConfigCollection().include(test.key, type, test.option)
      const config = new AppConfigurationChecker(collection)

      expect(Object.keys(config.retrieveAll())).toHaveLength(1)
      expect(config.retrieve(test.key)).toStrictEqual(test.expected)
    }
  }

  it('should validate and retrieve a text config', () => {
    const tests = [
      {
        key: 'REQUIRED_TEXT_A',
        value: 'some text',
        expected: 'some text'
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Text, tests)
  })

  it('should validate and retrieve a number', () => {
    const tests = [
      {
        key: 'REQUIRED_NUMBER_A',
        value: '123',
        expected: 123
      },
      {
        key: 'REQUIRED_NUMBER_B',
        value: '999999',
        expected: 999999
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Number, tests)
  })

  it('should validate and retrieve a negative number', () => {
    const tests = [
      {
        key: 'REQUIRED_NUMBER_A',
        value: '-2',
        expected: -2
      },
      {
        key: 'REQUIRED_NUMBER_B',
        value: '-100',
        expected: -100
      },
      {
        key: 'REQUIRED_NUMBER_C',
        value: '-999999',
        expected: -999999
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Number, tests)
  })

  it('should validate and retrieve the number zero', () => {
    const tests = [
      {
        key: 'REQUIRED_NUMBER_A',
        value: '0',
        expected: 0
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Number, tests)
  })

  it('should validate and retrieve "truthy" boolean values', () => {
    const tests = [
      {
        key: 'REQUIRED_BOOLEAN_A',
        value: 'true',
        expected: true
      },
      {
        key: 'REQUIRED_BOOLEAN_B',
        value: 'yes',
        expected: true
      },
      {
        key: 'REQUIRED_BOOLEAN_C',
        value: '1',
        expected: true
      },
      {
        key: 'REQUIRED_BOOLEAN_D',
        value: 'TRuE',
        expected: true
      },
      {
        key: 'REQUIRED_BOOLEAN_E',
        value: 'yES',
        expected: true
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Boolean, tests)
  })

  it('should validate and retrieve "falsy" boolean values', () => {
    const tests = [
      {
        key: 'REQUIRED_BOOLEAN_F',
        value: 'false',
        expected: false
      },
      {
        key: 'REQUIRED_BOOLEAN_G',
        value: 'no',
        expected: false
      },
      {
        key: 'REQUIRED_BOOLEAN_H',
        value: '0',
        expected: false
      },
      {
        key: 'REQUIRED_BOOLEAN_I',
        value: 'FAlsE',
        expected: false
      },
      {
        key: 'REQUIRED_BOOLEAN_J',
        value: 'nO',
        expected: false
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Boolean, tests)
  })

  it('should validate and retrieve a list of a single value', () => {
    const tests = [
      {
        key: 'REQUIRED_LIST_A',
        value: 'one',
        expected: ['one']
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.List, tests)
  })

  it('should validate and retrieve a list with many values', () => {
    const tests = [
      {
        key: 'REQUIRED_LIST_A',
        value: 'one,two,three',
        expected: ['one', 'two', 'three']
      },
      {
        key: 'REQUIRED_LIST_B',
        value: 'one, two, three',
        expected: ['one', ' two', ' three']
      },
      {
        key: 'REQUIRED_LIST_C',
        value: ',,,',
        expected: ['', '', '', '']
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.List, tests)
  })

  it('should validate and retrieve an enum', () => {
    const tests = [
      {
        key: 'REQUIRED_ENUM_A',
        value: 'one',
        expected: 'one',
        option: {
          items: ['one', 'two', 'three']
        }
      },
      {
        key: 'REQUIRED_ENUM_B',
        value: 'two',
        expected: 'two',
        option: {
          items: ['one', 'two', 'three']
        }
      },
      {
        key: 'REQUIRED_ENUM_C',
        value: 'three',
        expected: 'three',
        option: {
          items: ['one', 'two', 'three']
        }
      }
    ]

    validateRetrieveAndExpectStrictEqual(CVT.Enum, tests)
  })

  it('should be able to handle optional configs', () => {
    const tests = [
      {
        key: 'OPTIONAL_TEXT',
        expected: ''
      },
      {
        key: 'OPTIONAL_NUMBER',
        expected: 0
      },
      {
        key: 'OPTIONAL_BOOLEAN',
        expected: false
      },
      {
        key: 'OPTIONAL_LIST',
        expected: []
      },
      {
        key: 'OPTIONAL_ENUM',
        expected: ''
      }
    ]

    const collection = new ConfigCollection()
      .include('OPTIONAL_TEXT', CVT.Text, { isRequired: false })
      .include('OPTIONAL_NUMBER', CVT.Number, { isRequired: false })
      .include('OPTIONAL_BOOLEAN', CVT.Boolean, { isRequired: false })
      .include('OPTIONAL_LIST', CVT.List, { isRequired: false })
      .include('OPTIONAL_ENUM', CVT.Enum, { isRequired: false })

    const config = new AppConfigurationChecker(collection)
    tests.forEach((test) => expect(config.retrieve(test.key)).toEqual(test.expected))
  })
})

describe('AppConfigurationChecker | Validation and type errors', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  const validateRetrieveAndExpectToThrow = (type: CVT, test: ITestCaseWithExpectedError): void => {
    process.env[test.key] = test.value

    const collection = new ConfigCollection().include(test.key, type, test.option)
    expect(() => new AppConfigurationChecker(collection)).toThrowError(test.expectedError)
  }

  it('should not allow a text value for a number type config', () => {
    const test = {
      key: 'REQUIRED_NUMBER_A',
      value: 'not a number',
      expected: null,
      expectedError: 'environment variable REQUIRED_NUMBER_A is not of type number'
    }

    validateRetrieveAndExpectToThrow(CVT.Number, test)
  })

  it('should not allow a non "truthy/falsy" value for a boolean type config', () => {
    const test = {
      key: 'REQUIRED_BOOLEAN_A',
      value: 'not a boolean',
      expected: null,
      expectedError: 'environment variable REQUIRED_BOOLEAN_A is not of type boolean'
    }

    validateRetrieveAndExpectToThrow(CVT.Boolean, test)
  })

  it('should not allow a value outside the "items" list for an enum type config', () => {
    const test = {
      key: 'REQUIRED_ENUM_A',
      value: 'one',
      expected: null,
      option: {
        items: ['two', 'three']
      },
      expectedError: 'environment variable REQUIRED_ENUM_A is not of type enum'
    }

    validateRetrieveAndExpectToThrow(CVT.Enum, test)
  })

  it('should not allow an undeclared config to be retrieved', () => {
    expect(() => new AppConfigurationChecker().retrieve('UNDECLARED')).toThrowError('unknown environment variable "UNDECLARED"')
  })

  it('should not allow a config to be declared when the environment variable is already set', () => {
    const vars = {
      MY_TEXT_VAR: 'my text value',
      MY_NUMBER_VAR: '123',
      MY_BOOLEAN_VAR: 'true',
      MY_LIST_VAR: 'one,two,three',
      MY_ENUM_VAR: 'one'
    }

    process.env = { ...OLD_ENV, ...vars }

    const config = new AppConfigurationChecker()

    for (const key of Object.keys(vars)) {
      expect(() => config.declare(key, CVT.Text)).toThrowError(`environment variable "${key}" already declared`)
    }
  })

  it('should throw an error if a single required config is missing', () => {
    const collection = new ConfigCollection().include('REQUIRED_TEXT', CVT.Text)
    expect(() => new AppConfigurationChecker(collection)).toThrowError('missing environment variables: "REQUIRED_TEXT"')
  })

  it('should throw an error if multiple required configs are missing', () => {
    const collection = new ConfigCollection()
      .include('REQUIRED_TEXT', CVT.Text)
      .include('REQUIRED_NUMBER', CVT.Number)
      .include('REQUIRED_BOOLEAN', CVT.Boolean)
      .include('REQUIRED_LIST', CVT.List)
      .include('REQUIRED_ENUM', CVT.Enum)

    const m =
      'missing environment variables: "REQUIRED_TEXT", "REQUIRED_NUMBER", "REQUIRED_BOOLEAN", "REQUIRED_LIST", "REQUIRED_ENUM"'

    expect(() => new AppConfigurationChecker(collection)).toThrowError(m)
  })
})
