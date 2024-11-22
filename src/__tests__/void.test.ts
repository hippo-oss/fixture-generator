import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.void', () => {
    it('should correctly return a void', () => {
        const test = newFixture<void>();
        expect(test).toBeUndefined();
    });
});
