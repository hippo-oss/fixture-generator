import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.number', () => {
    it('should correctly return a default number', () => {
        const test = newFixture<number>();
        expect(test)
            .toBe(1);
    });
    it('should correctly allow a custom number', () => {
        const test = newFixture<number>(100);
        expect(test)
            .toBe(100);
    });
    it('should correctly return a number literal', () => {
        const test = newFixture<2>();
        expect(test)
            .toBe(2);
    });
    // Has to be commented out as throws compile time error as intended
    // it('should throw compile time error if explicitly using undefined for a type which cannot be undefined',
    //     () => {
    //         const test = newFixture<number>(undefined);
    //         expect(test)
    //             .toBe('defaultString');
    //     });
});
