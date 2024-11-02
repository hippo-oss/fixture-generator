import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.string', () => {
    it('should correctly return a default string', () => {
        const test = newFixture<string>();
        expect(test)
            .toBe('defaultString');
    });
    it('should correctly allow a custom string', () => {
        const test = newFixture<string>('customString');
        expect(test)
            .toBe('customString');
    });
    it('should correctly return a string literal', () => {
        const test = newFixture<'literal'>();
        expect(test)
            .toBe('literal');
    });
    // Has to be commented out as throws compile time error as intended
    // it('should throw compile time error if explicitly using undefined for a type which cannot be undefined',
    //     () => {
    //         const test = newFixture<string>(undefined);
    //         expect(test)
    //             .toBe('defaultString');
    //     });
});
