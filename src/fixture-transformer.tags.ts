export type DefaultFixture<DefaultFixtureValue> = {
    __defaultFixtureValue?: DefaultFixtureValue;
};

export type UUID = string & DefaultFixture<'00000000-0000-0000-0000-000000000000'>;
export type Email = string & DefaultFixture<'hippo@hungry.com'>;
export type PhoneNumber = string & DefaultFixture<'123-456-7890'>;
