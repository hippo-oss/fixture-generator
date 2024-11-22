import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.unknown', () => {
    it('should correctly return a default unknown', () => {
        const test = newFixture<unknown>();
        expect(test)
            .toBe('defaultUnknown');
    });
});
