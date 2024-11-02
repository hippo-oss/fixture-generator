import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../../fixture-transformer.function';
import { DefaultUndefinedOption } from '../../options';

describe('fixture-transformer.options.defaultUndefined', () => {
    interface UndefinedInterface {
        undefinedProperty: undefined;
        definedProperty: number;
    }

    describe('string assignment', () => {
        describe('direct assignment', () => {
            it('explicit', () => {
                const test = newFixture<UndefinedInterface, { defaultUndefined: 'explicit' }>();
                expect(test).toEqual({
                    undefinedProperty: undefined,
                    definedProperty: 1,
                });
                expect(Object.keys(test)).toContain('undefinedProperty');
            });

            it('nothing', () => {
                const test = newFixture<UndefinedInterface, { defaultUndefined: 'nothing' }>();
                expect(test).toEqual({
                    definedProperty: 1,
                });
                expect(Object.keys(test)).not.toContain('undefinedProperty');
            });

            it('undefined', () => {
                const test = newFixture<UndefinedInterface, { defaultUndefined: undefined }>();
                expect(test).toEqual({
                    undefinedProperty: undefined,
                    definedProperty: 1,
                });
                expect(Object.keys(test)).toContain('undefinedProperty');
            });
        });

        describe('indirect assignment', () => {
            it('explicit', () => {
                const defaultUndefined = 'explicit';
                const test = newFixture<UndefinedInterface, { defaultUndefined: typeof defaultUndefined }>();
                expect(test).toEqual({
                    undefinedProperty: undefined,
                    definedProperty: 1,
                });
                expect(Object.keys(test)).toContain('undefinedProperty');
            });

            it('nothing', () => {
                const defaultUndefined = 'nothing';
                const test = newFixture<UndefinedInterface, { defaultUndefined: typeof defaultUndefined }>();
                expect(test).toEqual({
                    definedProperty: 1,
                });
                expect(Object.keys(test)).not.toContain('undefinedProperty');
            });

            it('undefined', () => {
                const defaultUndefined = undefined;
                const test = newFixture<UndefinedInterface, { defaultUndefined: typeof defaultUndefined }>();
                expect(test).toEqual({
                    undefinedProperty: undefined,
                    definedProperty: 1,
                });
                expect(Object.keys(test)).toContain('undefinedProperty');
            });
        });
    });

    describe('enum assignment', () => {
        describe('direct assignment', () => {
            it('explicit', () => {
                const test = newFixture<
                    UndefinedInterface, { defaultUndefined: typeof DefaultUndefinedOption.Explicit }
                >();
                expect(test).toEqual({
                    undefinedProperty: undefined,
                    definedProperty: 1,
                });
                expect(Object.keys(test)).toContain('undefinedProperty');
            });

            it('nothing', () => {
                const test = newFixture<
                    UndefinedInterface, { defaultUndefined: typeof DefaultUndefinedOption.Nothing }
                >();
                expect(test).toEqual({
                    definedProperty: 1,
                });
                expect(Object.keys(test)).not.toContain('undefinedProperty');
            });
        });

        describe('indirect assignment', () => {
            it('explicit', () => {
                const defaultUndefined = DefaultUndefinedOption.Explicit;
                const test = newFixture<UndefinedInterface, { defaultUndefined: typeof defaultUndefined }>();
                expect(test).toEqual({
                    undefinedProperty: undefined,
                    definedProperty: 1,
                });
                expect(Object.keys(test)).toContain('undefinedProperty');
            });

            it('nothing', () => {
                const defaultUndefined = DefaultUndefinedOption.Nothing;
                const test = newFixture<UndefinedInterface, { defaultUndefined: typeof defaultUndefined }>();
                expect(test).toEqual({
                    definedProperty: 1,
                });
                expect(Object.keys(test)).not.toContain('undefinedProperty');
            });
        });
    });
});
