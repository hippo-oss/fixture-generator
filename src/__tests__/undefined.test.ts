import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';
import { DefaultUndefinedOption } from '../options';
import { UndefinedOption } from '../fixture-transformer.undefined';

describe('fixture-transformer.undefined', () => {
    it('should correctly return a default undefined', () => {
        const test = newFixture<undefined>();
        expect(test)
            .toBeUndefined();
    });

    describe('interface', () => {
        interface UndefinedInterface {
            undefinedProperty: undefined;
        }

        it('should be able to set a property to be explicitly undefined', () => {
            const test = newFixture<UndefinedInterface, { defaultUndefined: typeof DefaultUndefinedOption.Nothing }>({
                undefinedProperty: UndefinedOption.Explicit,
            });
            expect(test).toEqual({
                undefinedProperty: undefined,
            });
            expect(Object.keys(test)).toContain('undefinedProperty');
        });

        it('should not set a property to not show up in the object', () => {
            const test = newFixture<UndefinedInterface, { defaultUndefined: typeof DefaultUndefinedOption.Explicit }>({
                undefinedProperty: UndefinedOption.Nothing,
            });

            expect(test).toEqual({});
            expect(Object.keys(test)).not.toContain('undefinedProperty');
        });
    });

    describe('class', () => {
        class UndefinedClass {
            undefinedProperty: undefined;
        }

        it('should be able to set a property to be explicitly undefined', () => {
            const test = newFixture<UndefinedClass, { defaultUndefined: typeof DefaultUndefinedOption.Nothing }>({
                undefinedProperty: UndefinedOption.Explicit,
            });
            expect(test).toEqual({
                undefinedProperty: undefined,
            });
            expect(Object.keys(test)).toContain('undefinedProperty');
        });

        it('should not set a property to not show up in the object', () => {
            const test = newFixture<UndefinedClass, { defaultUndefined: typeof DefaultUndefinedOption.Explicit }>({
                undefinedProperty: UndefinedOption.Nothing,
            });
            expect(test).toEqual({});
            expect(Object.keys(test)).not.toContain('undefinedProperty');
        });
    });
});
