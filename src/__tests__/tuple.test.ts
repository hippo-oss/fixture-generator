import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.tuple', () => {
    it('should correctly return a tuple with a default value', () => {
        const test = newFixture<[string]>();
        expect(test)
            .toEqual(['defaultString']);
    });

    it('should correctly return a multi element tuple with a default value', () => {
        const test = newFixture<[string, number, string]>([]);
        expect(test)
            .toEqual(['defaultString', 1, 'defaultString']);
    });

    it('should correctly return a tuple with a custom value', () => {
        const test = newFixture<[string]>(['customString']);
        expect(test)
            .toEqual(['customString']);
    });

    it('should correctly return a tuple with a partial custom value', () => {
        const test = newFixture<[string, number, string]>(['customString']);
        expect(test)
            .toEqual(['customString', 1, 'defaultString']);
    });

    describe('variadic tuples', () => {
        const testCases: { fixture: unknown; expected: unknown; description?: string; }[] = [
            { fixture: newFixture<[string, ...number[]]>(), expected: ['defaultString', 1] },
            { fixture: newFixture<[string, ...number[]]>(['customString', 2, 3]), expected: ['customString', 2, 3] },
            { fixture: newFixture<[string, ...number[]]>(['customString']), expected: ['customString'] },
            { fixture: newFixture<[...string[], number]>(), expected: ['defaultString', 1] },
            {
                fixture: newFixture<[...string[], number]>(['customString', 'customString2', 2]),
                expected: ['customString', 'customString2', 2],
            },
            // TODO: add better support for non-ending variadic tuples
            // known broken test
            // { fixture: newFixture<[...string[], number]>(['customString']), expected: ['customString', 1] },
            { fixture: newFixture<[...string[], number]>([2]), expected: [2] },
            { fixture: newFixture<[string, ...number[], boolean]>(), expected: ['defaultString', 1, true] },
            {
                fixture: newFixture<[string, ...number[], boolean]>(['customString', 2, 3, false]),
                expected: ['customString', 2, 3, false],
            },
            { fixture: newFixture<[string, ...number[], boolean]>(['customString']), expected: ['customString', true] },
            // TODO: add better support for non-ending variadic tuples
            // known broken test
            // {
            //     fixture: newFixture<[string, ...number[], boolean]>(['customString', 2]),
            //     expected: ['customString', 2, true],
            // },
            {
                fixture: newFixture<[string, ...number[], boolean]>(['customString', false]),
                expected: ['customString', false],
            },
            { fixture: newFixture<[...string[], string]>(), expected: ['defaultString', 'defaultString'] },
            {
                fixture: newFixture<[...string[], string]>(['customString', 'customString2']),
                expected: ['customString', 'customString2'],
            },
            { fixture: newFixture<[...string[], string]>(['customString']), expected: ['customString'] },
        ];

        testCases.forEach(({ fixture, expected, description }, index) => {
            it(description ?? `should work for test case ${index}`, () => {
                expect(fixture).toEqual(expected);
            });
        });
    });
});
