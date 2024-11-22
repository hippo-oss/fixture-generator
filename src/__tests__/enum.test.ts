import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.enum', () => {
    it('should return the first enum value for number enums', () => {
        enum TestEnum {
            First,
            Second,
            Third,
        }

        const test = newFixture<TestEnum>();
        expect(test)
            .toBe(TestEnum.First);
    });

    it('should return the first enum value for string enums', () => {
        enum TestEnum {
            First = 'First',
            Second = 'Second',
            Third = 'Third',
        }

        const test = newFixture<TestEnum>();
        expect(test)
            .toBe(TestEnum.First);
    });

    it('should return the first enum value for mixed enums', () => {
        enum TestEnum {
            First,
            Second = 'Second',
            Third = 'Third',
        }

        const test = newFixture<TestEnum>();
        expect(test)
            .toBe(TestEnum.First);
    });

    it('should allow a custom enum value', () => {
        enum TestEnum {
            First,
            Second,
            Third,
        }

        const test = newFixture<TestEnum>(TestEnum.Third);
        expect(test)
            .toBe(TestEnum.Third);
    });
});
