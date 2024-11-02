import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.date', () => {
    it('should correctly return a date with a default value', () => {
        const test = newFixture<Date>();
        expect(test).toEqual(new Date(Date.UTC(1999, 10, 1)));
    });

    it('should correctly return a date with a custom value', () => {
        const test = newFixture<Date>(new Date(2000, 10, 1));
        expect(test).toEqual(new Date(2000, 10, 1));
    });
});
