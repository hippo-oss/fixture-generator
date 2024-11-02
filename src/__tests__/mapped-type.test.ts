import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.mapped-type', () => {
    describe('pick', () => {
        it('should correctly return a type with only the specified properties', () => {
            interface TestInterface {
                testString: string;
                testNumber: number;
                testBoolean: boolean;
            }

            const test = newFixture<Pick<TestInterface, 'testString' | 'testNumber'>>();
            expect(test).toEqual({
                testString: 'defaultTestString',
                testNumber: 1,
            });
        });
    });
});
