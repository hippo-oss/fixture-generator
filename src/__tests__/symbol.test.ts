import expect from 'expect';
import { newFixture } from '../fixture-transformer.function';
import { symbolTest } from './test-objects/different-file-symbol';

describe('fixture-transformer.symbol', () => {
        it('should correctly return a default symbol', () => {
            const test = newFixture<symbol>();
            expect(test.toString())
                .toBe(Symbol('defaultSymbol').toString());

        });
        it('should correctly allow a custom symbol', () => {
            const symbol = Symbol('customSymbol');
            const test = newFixture<symbol>(symbol);
            expect(test)
                .toBe(symbol);
        });
        it('should correctly return unique symbols', () => {
            const testSymbol = Symbol('testSymbol');

            const test = newFixture<{ testSymbol: typeof testSymbol }>();
            expect(test)
                .toEqual({ testSymbol });
        });
        it('should correctly work with unique symbols defined in another file', () => {
            const test = newFixture<{ symbolTest: typeof symbolTest }>();
            expect(test)
                .toEqual({ symbolTest });
        });
        it('should correctly work with symbols as the key of an object', () => {
            const testSymbol = Symbol('testSymbol');
            const test = newFixture<{ [testSymbol]: string }>();
            expect(test)
                .toEqual({ [testSymbol]: 'defaultTestSymbol' });
        });
});
