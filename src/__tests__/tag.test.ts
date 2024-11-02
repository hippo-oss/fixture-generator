import { jestExpect as expect } from 'mocha-expect-snapshot';
import { newFixture } from '../fixture-transformer.function';
import { DefaultFixture, Email, PhoneNumber, UUID } from '../fixture-transformer.tags';

describe('fixture-transformer.tag', () => {
    it('should correctly return an explicit default tag', () => {
        const test = newFixture<string & DefaultFixture<'test'>>();
        expect(test).toEqual('test');
    });

    it('should correctly return the default tag set on the type', () => {
        const test = newFixture<UUID>();
        expect(test).toEqual('00000000-0000-0000-0000-000000000000');
    });

    it('should return the correct default tags for properties of an interface', () => {
        interface TestInterface {
            testString: string & DefaultFixture<'testString'>;
            testNumber: number & DefaultFixture<100>;
            testEmail: Email;
            testPhoneNumber: PhoneNumber;
        }

        const test = newFixture<TestInterface>();
        expect(test).toEqual({
            testString: 'testString',
            testNumber: 100,
            testEmail: 'hippo@hungry.com',
            testPhoneNumber: '123-456-7890',
        });
    });

    it('should correctly use an outer default tag before constituent property default tags', () => {
        type TestInterface = {
            testFirstName: string & DefaultFixture<'propertyDefault'>;
            testLastName: string & DefaultFixture<'propertyDefault'>;
        } & DefaultFixture<{
            testFirstName: string & DefaultFixture<'outerDefault'>;
            testLastName: string & DefaultFixture<'outerDefault'>;
        }>;

        const test = newFixture<TestInterface>();
        expect(test).toEqual({
            testFirstName: 'outerDefault',
            testLastName: 'outerDefault',
        });
    });

    it('custom values should still override default tags', () => {
        const test = newFixture<string & DefaultFixture<'oldDefault'>>('customOverride');
        expect(test).toEqual('customOverride');
    });

    it('should allow type default values and not just literals', () => {
        const test = newFixture<(string | number | undefined) & DefaultFixture<number>>();
        expect(test).toEqual(1);
    });
});
