import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.any', () => {
    it('should correctly return a default any', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
        const test = newFixture<any>();
        expect(test)
            .toBe('defaultAny');
    });
});
