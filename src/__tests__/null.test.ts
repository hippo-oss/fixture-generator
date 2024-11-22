import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.null', () => {
    it('should correctly return a default null', () => {
        const test = newFixture<null>();
        expect(test)
            .toBeNull();
    });
});
