import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.intersection', () => {
    it('should correctly return a combined object from an intersection', () => {
        type TestIntersection = { testString: string, testNumber: 1 } & { testNumber: 100 };
        const test = newFixture<TestIntersection>();
        expect(test)
            .toEqual({
                testString: 'defaultTestString',
                testNumber: 100,
            });
    });

    it('should allow for partial overrides', () => {
        type TestIntersection = { testString: string } & { testNumber: number };
        const test = newFixture<TestIntersection>({
            testString: 'customTestString',
        });
        expect(test)
            .toEqual({
                testString: 'customTestString',
                testNumber: 1,
            });
    });

    it('should correctly return a type from a non-object intersection', () => {
        type TestIntersection = { testString: string } & string;
        const test = newFixture<TestIntersection>();
        expect(test)
            .toBe('defaultString');
    });
});
