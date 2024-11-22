import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';

describe('fixture-transformer.union', () => {
    it('should correctly return a type from a union', () => {
        type TestUnion = string | number;
        const test = newFixture<TestUnion>();
        expect(test)
            .toBe('defaultString');
    });

    it('allows overriding with undefined if a part of a union which allows undefined', () => {
        type TestUnion = string | undefined;
        const test = newFixture<TestUnion>(undefined);
        expect(test)
            .toBeUndefined();
    });

    it('if one the types in the union is undefined, it should return the other type', () => {
        type TestUnion = string | undefined;
        const test = newFixture<TestUnion>();
        expect(test)
            .toBe('defaultString');
    });

    it('if one of the types in the union is null, it should return the other type', () => {
        type TestUnion = string | null;
        const test = newFixture<TestUnion>();
        expect(test)
            .toBe('defaultString');
    });

    it('should allow for partial overrides with a union where one of the members in an interface', () => {
       type TestUnion = string | { testString1: string, testString2: string };
       const test = newFixture<TestUnion>({
           testString1: 'customTestString1',
       });
       expect(test)
           .toEqual({
               testString1: 'customTestString1',
               testString2: 'defaultTestString2',
           });
    });

    it('should allow for partial overrides with a union where one of the members in an array', () => {
        type TestUnion = string | string[];
        const test = newFixture<TestUnion>(['customTestString1']);
        expect(test)
            .toEqual(['customTestString1']);
    });

    it('should allow for partial overrides with a union where one of the members in an array of interfaces', () => {
        type TestUnion = string | { testString1: string, testString2: string }[];
        const test = newFixture<TestUnion>([{ testString1: 'customTestString1' }]);
        expect(test)
            .toEqual([{ testString1: 'customTestString1', testString2: 'defaultTestString2' }]);
    });

    it('should allow for partial overrides with a union where one of the members in an array of interfaces'
        + ' and the other member is undefined', () => {
        type TestUnion = string | { testString1: string, testString2: string }[];
        const test = newFixture<TestUnion>([{ testString1: 'customTestString1' }]);
        expect(test)
            .toEqual([{ testString1: 'customTestString1', testString2: 'defaultTestString2' }]);
    });

    it('should allow for partial overrides with a union where one of the members in an array of interfaces,'
        + ' and the array elements are a union', () => {
        type TestInterface1 = { testString1: string, testString2: string };
        type TestInterface2 = { testString3: string, testString4: string };
        type TestUnion = string | (TestInterface1 | TestInterface2)[];
        const test = newFixture<TestUnion>([{ testString1: 'customTestString1' }]);
        expect(test)
            .toEqual([{ testString1: 'customTestString1', testString2: 'defaultTestString2' }]);
    });

    it('should allow for partial overrides with a union where one of the members is a tuple', () => {
        type TestUnion = string | [string, number];
        const test = newFixture<TestUnion>(['customTestString']);
        expect(test)
            .toEqual(['customTestString', 1]);
    });

    it('should choose the correct tuple for a union of tuples with partial overrides', () => {
        type TestUnion = string | [string, number, number] | [string, boolean, string];
        const test = newFixture<TestUnion>(['customTestString', false]);
        expect(test)
            .toEqual(['customTestString', false, 'defaultString']);
    });
});
