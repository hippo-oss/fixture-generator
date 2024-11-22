import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.map', () => {
    it('should correctly return a map with a default value', () => {
        const test = newFixture<Map<unknown, unknown>>();
        expect(test)
            .toEqual(new Map([['defaultUnknown', 'defaultUnknown']]));
    });

    it('should correctly return a map with a default value based on the type args', () => {
        const test = newFixture<Map<string, number>>();
        expect(test)
            .toEqual(new Map([['defaultString', 1]]));
    });

    it('should correctly allow custom map overrides', () => {
        const test = newFixture<Map<string, number>>(new Map([
            ['customString', 100],
            ['customerString2', 102],
        ]));
        expect(test)
            .toEqual(new Map([
                ['customString', 100],
                ['customerString2', 102],
            ]));
    });
});
