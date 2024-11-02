import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.bigInt', () => {
    it('should correctly return a default bigInt', () => {
        const test = newFixture<bigint>();
        expect(test)
            .toBe(BigInt(9007199254740992));
    });
    it('should correctly allow a custom bigInt', () => {
        const test = newFixture<bigint>(BigInt(100));
        expect(test)
            .toBe(BigInt(100));
    });
    // Has to be commented out as throws compile time error as intended
    // it('should throw compile time error if explicitly using undefined for a type which cannot be undefined',
    //     () => {
    //         const test = newFixture<bigint>(undefined);
    //         expect(test)
    //             .toBe('defaultString');
    //     });

    it('should correctly return a bigInt literal', () => {
        const test = newFixture<2n>();
        expect(test).toBe(BigInt(2));
    });

    it('should correctly return a large bigInt literal', () => {
        const test = newFixture<9007199254740992n>();
        expect(test).toBe(BigInt(9007199254740992));
    });
});
