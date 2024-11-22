import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../../fixture-transformer.function';

describe('fixture-transformer.options.preferUndefined', () => {
    interface UndefinedInterface {
        testString?: string;
        testNumber: number | undefined;
        testNonOptionalString: string;
    }

    const trueResult = {
        testString: undefined,
        testNumber: undefined,
        testNonOptionalString: 'defaultTestNonOptionalString',
    };

    const falseResult = {
        testString: 'defaultTestString',
        testNumber: 1,
        testNonOptionalString: 'defaultTestNonOptionalString',
    };

    describe('direct assignment', () => {
        it('true', () => {
            const test = newFixture<UndefinedInterface, { preferUndefined: true }>();
            expect(test).toEqual(trueResult);
        });

        it('false', () => {
            const test = newFixture<UndefinedInterface, { preferUndefined: false }>();
            expect(test).toEqual(falseResult);
        });

        it('undefined', () => {
            const test = newFixture<UndefinedInterface, { preferUndefined: undefined }>();
            expect(test).toEqual(falseResult);
        });
    });

    describe('indirect assignment', () => {
        it('true', () => {
            const preferUndefined = true;
            const test = newFixture<UndefinedInterface, { preferUndefined: typeof preferUndefined }>();
            expect(test).toEqual(trueResult);
        });

        it('false', () => {
            const preferUndefined = false;
            const test = newFixture<UndefinedInterface, { preferUndefined: typeof preferUndefined }>();
            expect(test).toEqual(falseResult);
        });

        it('undefined', () => {
            const preferUndefined = undefined;
            const test = newFixture<UndefinedInterface, { preferUndefined: typeof preferUndefined }>();
            expect(test).toEqual(falseResult);
        });
    });
});
