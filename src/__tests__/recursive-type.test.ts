import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.recursive-type', () => {
    it('should eventually pick a recursive types base case', () => {
        type RecursiveType = {
            value: number;
            next?: RecursiveType;
        };

        const test = newFixture<RecursiveType>();
        expect(test).toEqual(expect.objectContaining({
            value: 1,
        }));
    });

    it('should handle complex recursive types', () => {
        type RecursiveType1 = {
            value: number;
            next: RecursiveType2
        };

        type RecursiveType2 = {
            value: number;
            next: RecursiveType1 | RecursiveType2 | string;
        };

        const test = newFixture<RecursiveType1>();
        expect(test).toEqual(expect.objectContaining({
            value: 1,
        }));
    });
});
