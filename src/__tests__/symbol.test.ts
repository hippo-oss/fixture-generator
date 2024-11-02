describe('fixture-transformer.symbol', () => {
    // known broken tests can't be xit'd and instead have to be commented out (as they fail when being compiled)
    //     it('should correctly return a default symbol', () => {
    //         const test = newFixture<symbol>();
    //         expect(test)
    //             .toBe(Symbol('defaultSymbol'));
    //     });
    //     it('should correctly allow a custom symbol', () => {
    //         const test = newFixture<symbol>(Symbol('customSymbol'));
    //         expect(test)
    //             .toBe(Symbol('customSymbol'));
    //     });
    //     it('should correctly return the exact typed symbol in an object', () => {
    //         const testSymbol = Symbol('testSymbol');
    //         const test = newFixture<{ testSymbol: typeof testSymbol }>();
    //         expect(test)
    //             .toEqual({ testSymbol });
    //     });
});
