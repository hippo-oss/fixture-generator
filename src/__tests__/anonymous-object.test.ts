import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.anonymous-object', () => {
    it('should correctly return a default anonymous object', () => {
        const test = newFixture<{ testNumber: number, testBoolean: boolean }>();
        expect(test)
            .toEqual({
                testNumber: 1,
                testBoolean: true,
            });
    });

    it('should return strings with the name of the field', () => {
        const test = newFixture<{ testString: string }>();
        expect(test)
            .toEqual({
                testString: 'defaultTestString',
            });
    });

    it('should work with nested anonymous objects', () => {
        const test = newFixture<{ testNestedObject: { testString: string } }>();
        expect(test)
            .toEqual({
                testNestedObject: {
                    testString: 'defaultTestString',
                },
            });
    });

    it('should correctly allow a custom value', () => {
        const test = newFixture<{ testNumber: number, testBoolean: boolean }>({
            testNumber: 100,
        });
        expect(test)
            .toEqual({
                testNumber: 100,
                testBoolean: true,
            });
    });

    it('should work for number index signature key values', () => {
        const test = newFixture<{ [key: number]: string }>({ 0: 'test' });
        expect(test)
            .toEqual({
                0: 'test',
            });
    });

    it('should work for number index signature key values through indirection', () => {
        const variable = 0;
        const test = newFixture<{ [key: number]: string }>({ [variable]: 'test' });
        expect(test)
            .toEqual({
                0: 'test',
            });
    });

    it('should allow overrides for index signature key values', () => {
        const test = newFixture<{ [key: string]: number }>({
            variableNumber: 100,
        });
        expect(test)
            .toEqual({
                variableNumber: 100,
            });
    });

    it('should allow overrides for union index signature key values', () => {
        const test = newFixture<{ [key: string | number]: number }>({
            variableNumber: 100,
        });
        expect(test)
            .toEqual({
                variableNumber: 100,
            });
    });

    it('should allow partial overrides for index signature key values', () => {
        const test = newFixture<{ [key: string]: {
            [key: string]: number,
            definedKey1: number,
            definedKey2: number
        } }>({
            test: {
                variableNumber: 100,
            },
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

    // known broken tests can't be xit'd and instead have to be commented out (as they fail when being compiled)
    // it('should work with multiple different index signature key values', () => {
    //     const symbol = Symbol('key');
    //     const test = newFixture<{ [key: string]: string, [key: symbol]: number }>({
    //         testNumber: 'testString',
    //         [symbol]: 200,
    //     });
    //     expect(test)
    //         .toEqual({
    //             testNumber: 100,
    //             [symbol]: 200,
    //         });
    // });
});
