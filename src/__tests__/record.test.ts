import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.record', () => {
    it('should correctly return a record with a default value', () => {
        const test = newFixture<Record<string, string>>({ variableString: 'customString' });
        expect(test)
            .toEqual({ variableString: 'customString' });
    });

    it('should correctly return a literal record with a default value', () => {
        const test = newFixture<Record<'test', string>>({});
        expect(test)
            .toEqual({ test: 'defaultTest' });
    });

    it('should correctly allow overrides on literal records', () => {
        const test = newFixture<Record<'test', string>>({ test: 'customTest' });
        expect(test)
            .toEqual({ test: 'customTest' });
    });

    it('should correctly return a union record with a default value', () => {
        const test = newFixture<Record<'one' | 'two', string>>({});
        expect(test)
            .toEqual({ one: 'defaultOne', two: 'defaultTwo' });
    });

    it('should correctly return an enum record with a default value', () => {
        enum TestEnum {
            first = 'first',
            second = 'second',
            third = 'third',
        }

        const test = newFixture<Record<TestEnum, string>>({});
        expect(test)
            .toEqual({
                [TestEnum.first]: 'defaultFirst',
                [TestEnum.second]: 'defaultSecond',
                [TestEnum.third]: 'defaultThird',
            });
    });

    it('should allow for overrides on enum records', () => {
        enum TestEnum {
            first = 'first',
            second = 'second',
            third = 'third',
        }

        const test = newFixture<Record<TestEnum, string>>({
            [TestEnum.first]: 'customFirst',
            [TestEnum.second]: 'customSecond',
        });
        expect(test)
            .toEqual({
                [TestEnum.first]: 'customFirst',
                [TestEnum.second]: 'customSecond',
                [TestEnum.third]: 'defaultThird',
            });
    });
});
