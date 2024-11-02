import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../../fixture-transformer.function';

describe('fixture-transformer.options.preferNull', () => {
    interface NullInterface {
        testString: string | null;
        testNumber: number | null;
        testNonNullString: string;
    }

    const trueResult = {
        testString: null,
        testNumber: null,
        testNonNullString: 'defaultTestNonNullString',
    };

    const falseResult = {
        testString: 'defaultTestString',
        testNumber: 1,
        testNonNullString: 'defaultTestNonNullString',
    };

    describe('direct assignment', () => {
        it('true', () => {
            const test = newFixture<NullInterface, { preferNull: true }>();
            expect(test).toEqual(trueResult);
        });

        it('false', () => {
            const test = newFixture<NullInterface, { preferNull: false }>();
            expect(test).toEqual(falseResult);
        });

        it('undefined', () => {
            const test = newFixture<NullInterface, { preferNull: undefined }>();
            expect(test).toEqual(falseResult);
        });
    });

    describe('indirect assignment', () => {
        it('true', () => {
            const preferNull = true;
            const test = newFixture<NullInterface, { preferNull: typeof preferNull }>();
            expect(test).toEqual(trueResult);
        });

        it('false', () => {
            const preferNull = false;
            const test = newFixture<NullInterface, { preferNull: typeof preferNull }>();
            expect(test).toEqual(falseResult);
        });

        it('undefined', () => {
            const preferNull = undefined;
            const test = newFixture<NullInterface, { preferNull: typeof preferNull }>();
            expect(test).toEqual(falseResult);
        });
    });
});
