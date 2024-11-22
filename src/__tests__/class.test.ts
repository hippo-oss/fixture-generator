import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';
import { ExplicitConstructorTestClass, ImplicitConstructorTestClass } from './test-objects/different-file-test-classes';

describe('fixture-transformer.class', () => {
    describe('with an explicit constructor', () => {
        it('should correctly create a class instance using the constructor', () => {
            class TestClass {
                testNumber: number;
                testBoolean: boolean;

                constructor() {
                    this.testNumber = 200;
                    this.testBoolean = false;
                }
            }

            const test = newFixture<TestClass>();
            expect(test instanceof TestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumber: 200,
                    testBoolean: false,
                });
        });

        it('should correctly create a class instance using the constructor'
            + ' with default value for the constructor arguments', () => {
            class TestClass {
                testNumberString: string;
                testBooleanString: string;

                constructor(testNumber: number, testBoolean: boolean) {
                    this.testNumberString = testNumber.toString();
                    this.testBooleanString = testBoolean.toString();
                }
            }

            const test = newFixture<TestClass>();
            expect(test instanceof TestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumberString: '1',
                    testBooleanString: 'true',
                });
        });

        it('should correctly work with classes defined in different files', () => {
            const test = newFixture<ExplicitConstructorTestClass>();
            expect(test instanceof ExplicitConstructorTestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumber: 200,
                    testBoolean: false,
                });
        });

        it('should correctly allow a custom value', () => {
            class TestClass {
                testNumber: number;
                testBoolean: boolean;

                constructor() {
                    this.testNumber = 200;
                    this.testBoolean = false;
                }
            }

            const test = newFixture<TestClass>({
                testNumber: 100,
            });
            expect(test instanceof TestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumber: 100,
                    testBoolean: false,
                });
        });

        it('should work for non-standard property names', () => {
            class TestClass {
                'string-with-dashes': string;
                'string with spaces': string;
                '1StartingNumber': string;
                '@#SpecialChars': string;

                constructor() {
                    this['string-with-dashes'] = 'string-with-dashes';
                    this['string with spaces'] = 'string with spaces';
                    this['1StartingNumber'] = '1StartingNumber';
                    this['@#SpecialChars'] = '@#SpecialChars';
                }
            }

            const test = newFixture<TestClass>();

            expect(test)
                .toEqual({
                    'string-with-dashes': 'string-with-dashes',
                    'string with spaces': 'string with spaces',
                    '1StartingNumber': '1StartingNumber',
                    '@#SpecialChars': '@#SpecialChars',
                });
        });
    });

    describe('with out an explicit constructor', () => {
        it('should correctly create a class instance and set default values', () => {
            class TestClass {
                testNumber!: number;
                testBoolean!: boolean;
            }

            const test = newFixture<TestClass>();
            expect(test instanceof TestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumber: 1,
                    testBoolean: true,
                });
        });

        it('should work with classes defined in different files', () => {
            const test = newFixture<ImplicitConstructorTestClass>();
            expect(test instanceof ImplicitConstructorTestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumber: 1,
                    testBoolean: true,
                });
        });

        it('should correctly allow a custom value', () => {
            class TestClass {
                testNumber!: number;
                testBoolean!: boolean;
            }

            const test = newFixture<TestClass>({
                testNumber: 100,
            });
            expect(test instanceof TestClass)
                .toBe(true);
            expect(test)
                .toEqual({
                    testNumber: 100,
                    testBoolean: true,
                });
        });

        it('should correctly allow overrides for index signature key values', () => {
            class TestClass {
                definedKey: number = 1;
                [key: string]: number;
            }

            const test = newFixture<TestClass>({
                variableKey: 100,
            });

            expect(test)
                .toEqual({
                    definedKey: 1,
                    variableKey: 100,
                });
        });

        it('should work for symbol index signature key values', () => {
            class TestClass {
                [key: symbol]: string;
            }

            const testSymbol = Symbol('testSymbol');
            const test = newFixture<TestClass>({
                [testSymbol]: 'test',
            });

            expect(test)
                .toEqual({
                    [testSymbol]: 'test',
                });
        });

        it('should correctly allow partial overrides for index signature key values', () => {
            class TestClass {
                [key: string]: { [key: string]: number, definedKey1: number, definedKey2: number };
            }

            const test = newFixture<TestClass>({
                test: { variableNumber: 100 },
            });

            expect(test)
                .toEqual({
                    test: {
                        definedKey1: 1,
                        definedKey2: 1,
                        variableNumber: 100,
                    },
                });
        });

        it('should work for non-standard property names', () => {
            class TestClass {
                'string-with-dashes': string;
                'string with spaces': string;
                '1StartingNumber': string;
                '@#SpecialChars': string;
            }

            const test = newFixture<TestClass>();

            expect(test)
                .toEqual({
                    'string-with-dashes': 'defaultStringWithDashes',
                    'string with spaces': 'defaultStringWithSpaces',
                    '1StartingNumber': 'default1StartingNumber',
                    '@#SpecialChars': 'default@#SpecialChars',
                });
        });

        it('should not set values for private javascript properties', () => {
            class TestClass {
                #privateProperty: string | undefined;
                publicProperty!: string;

                getPrivateProperty(): string | undefined {
                    return this.#privateProperty;
                }
            }

            const test = newFixture<TestClass>();

            expect(test)
                .toEqual(expect.not.objectContaining({
                    '#privateProperty': expect.anything(),
                }));
        });
    });
});
