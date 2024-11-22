import { UndefinedOptionsDeepPartial } from './fixture-transformer.undefined';
import { NewFixtureOptions } from './options';

export function newFixture<T, Options extends NewFixtureOptions | undefined = undefined>(
    input?: UndefinedOptionsDeepPartial<T>,
): T {
    return input as Options as unknown as T;
}
