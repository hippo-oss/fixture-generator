import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.interface', () => {
    it('should correctly return a default interface', () => {
        interface TestInterface {
            testNumber: number;
            testBoolean: boolean;
        }

        const test = newFixture<TestInterface>();
        expect(test)
            .toEqual({
                testNumber: 1,
                testBoolean: true,
            });

    });

    it('should return strings with the name of the field', () => {
        interface TestInterface {
            testString: string;
        }

        const test = newFixture<TestInterface>();
        expect(test)
            .toEqual({
                testString: 'defaultTestString',
            });
    });

    it('should work with nested interfaces', () => {
        interface TestInterface {
            testNestedInterface: {
                testString: string;
            }
        }

        const test = newFixture<TestInterface>();
        expect(test)
            .toEqual({
                testNestedInterface: {
                    testString: 'defaultTestString',
                },
            });
    });

    it('should correctly allow a custom value', () => {
        interface TestInterface {
            testNumber: number;
            testBoolean: boolean;
        }

        const test = newFixture<TestInterface>({
            testNumber: 100,
        });
        expect(test)
            .toEqual({
                testNumber: 100,
                testBoolean: true,
            });
    });

    it('should allow partial custom values for deep nested interfaces', () => {
        interface TestInterface {
            testNestedInterface: {
                testString: string;
                testNumber: number;
            }
        }

        const test = newFixture<TestInterface>({
            testNestedInterface: {
                testString: 'customTestString',
            },
        });
        expect(test)
            .toEqual({
                testNestedInterface: {
                    testString: 'customTestString',
                    testNumber: 1,
                },
            });
    });

    it('should allow full overrides', () => {
        interface TestInterface {
            testString: string;
            testNumber: number;
        }

        const testInterfaceInstance: TestInterface = {
            testString: 'customTestString',
            testNumber: 100,
        };

        const test = newFixture<TestInterface>(testInterfaceInstance);
        expect(test)
            .toEqual(testInterfaceInstance);
    });

    it('should work for non-standard property names', () => {
        interface TestInterface {
            'string-with-dashes': string;
            'string with spaces': string;
            '1StartingNumber': string;
            '@#SpecialChars': string;
        }

        const test = newFixture<TestInterface>();
        expect(test)
            .toEqual({
                'string-with-dashes': 'defaultStringWithDashes',
                'string with spaces': 'defaultStringWithSpaces',
                '1StartingNumber': 'default1StartingNumber',
                '@#SpecialChars': 'default@#SpecialChars',
            });
    });
});
