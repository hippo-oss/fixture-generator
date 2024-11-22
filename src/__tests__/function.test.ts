import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.function', () => {
    it('should return a function with the default value of the return type', () => {
        const test = newFixture<() => string>();
        expect(test)
            .toBeInstanceOf(Function);
        expect(test())
            .toBe('defaultString');
    });
});
