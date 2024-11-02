import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.promise', () => {
    it('should return a promise that when resolved will return the default value of the return type', async () => {
        const test = newFixture<() => Promise<string>>();
        expect(test)
            .toBeInstanceOf(Function);
        expect(await test())
            .toBe('defaultString');
    });
});
