import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.boolean', () => {
    it('should correctly return a default boolean', () => {
        const test = newFixture<boolean>();
        expect(test)
            .toBe(true);
    });
    it('should correctly allow a custom boolean', () => {
        const test = newFixture<boolean>(false);
        expect(test)
            .toBe(false);
    });
    it('should correctly return a boolean literal', () => {
        const test = newFixture<false>();
        expect(test)
            .toBe(false);
    });
    // Has to be commented out as throws compile time error as intended
    // it('should throw compile time error if explicitly using undefined for a type which cannot be undefined',
    //     () => {
    //         const test = newFixture<boolean>(undefined);
    //         expect(test)
    //             .toBe('defaultString');
    //     });
});
