import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../../fixture-transformer.function';
import { DefaultEnumOption } from '../../options';

describe('fixture-transformer.options.defaultEnum', () => {
    enum OptionsTestEnum {
        Third = 'Third',
        Second = 'Second',
        First = 'First',
    }

    describe('string assignment', () => {
        describe('direct assignment', () => {
            it('astFirst', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: 'astFirst' }>();
                expect(test)
                    .toBe(OptionsTestEnum.Third);
            });

            it('alphaFirst', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: 'alphaFirst' }>();
                expect(test)
                    .toBe(OptionsTestEnum.First);
            });

            it('random', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: 'random' }>();
                expect(Object.values(OptionsTestEnum))
                    .toContain(test);
            });

            it('undefined', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: undefined }>();
                expect(test)
                    .toBe(OptionsTestEnum.Third);
            });
        });

        describe('indirect assignment', () => {
            it('astFirst', () => {
                const defaultEnum = 'astFirst';
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(test)
                    .toBe(OptionsTestEnum.Third);
            });

            it('alphaFirst', () => {
                const defaultEnum = 'alphaFirst';
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(test)
                    .toBe(OptionsTestEnum.First);
            });

            it('random', () => {
                const defaultEnum = 'random';
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(Object.values(OptionsTestEnum))
                    .toContain(test);
            });

            it('undefined', () => {
                const defaultEnum = undefined;
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(test)
                    .toBe(OptionsTestEnum.Third);
            });
        });
    });

    describe('enum assignment', () => {
        describe('direct assignment', () => {
            it('astFirst', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof DefaultEnumOption.AstFirst }>();
                expect(test)
                    .toBe(OptionsTestEnum.Third);
            });

            it('alphaFirst', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof DefaultEnumOption.AlphaFirst }>();
                expect(test)
                    .toBe(OptionsTestEnum.First);
            });

            it('random', () => {
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof DefaultEnumOption.Random }>();
                expect(Object.values(OptionsTestEnum))
                    .toContain(test);
            });
        });

        describe('indirect assignment', () => {
            it('astFirst', () => {
                const defaultEnum = DefaultEnumOption.AstFirst;
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(test)
                    .toBe(OptionsTestEnum.Third);
            });

            it('alphaFirst', () => {
                const defaultEnum = DefaultEnumOption.AlphaFirst;
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(test)
                    .toBe(OptionsTestEnum.First);
            });

            it('random', () => {
                const defaultEnum = DefaultEnumOption.Random;
                const test = newFixture<OptionsTestEnum, { defaultEnum: typeof defaultEnum }>();
                expect(Object.values(OptionsTestEnum))
                    .toContain(test);
            });
        });
    });
});
