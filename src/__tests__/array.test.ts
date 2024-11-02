import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.array', () => {
    it('should correctly return an array with a default value', () => {
        const test = newFixture<string[]>();
        expect(test)
            .toEqual(['defaultString']);
    });

    it('should correctly return an array with a custom value', () => {
        const test = newFixture<string[]>(['customString']);
        expect(test)
            .toEqual(['customString']);
    });

    it('should correctly return an empty custom array', () => {
        const test = newFixture<string[]>([]);
        expect(test)
            .toEqual([]);
    });
    it('should correctly fill out an array with a partial custom value', () => {
        interface TestInterface {
            testString: string;
            testNumber: number;
        }

        const test = newFixture<(TestInterface | string)[]>([{
            testString: 'customTestString',
        }, 'customString']);
        expect(test)
            .toEqual([{
                testString: 'customTestString',
                testNumber: 1,
            }, 'customString']);
    });
});
