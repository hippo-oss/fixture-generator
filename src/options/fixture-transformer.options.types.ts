import { UndefinedOption } from '../fixture-transformer.undefined';

export const DefaultEnumOption = {
    AstFirst: 'astFirst',
    AlphaFirst: 'alphaFirst',
    Random: 'random',
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DefaultEnumOption = typeof DefaultEnumOption[keyof typeof DefaultEnumOption];

export const DefaultUndefinedOption = Object.fromEntries(
    Object.keys(UndefinedOption).map((key) => [key, key.toLowerCase()]),
) as { [K in keyof typeof UndefinedOption]: Lowercase<K> };
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DefaultUndefinedOption = typeof DefaultUndefinedOption[keyof typeof DefaultUndefinedOption];

export type NewFixtureOptions = {
    // By default, for union types which contain undefined we will use the other value.
    // This option flips that preference.
    preferUndefined?: boolean;
    // By default, for union types which contain null we will use the other value.
    // This option flips that preference.
    preferNull?: boolean;
    // By default, the first value in an enum will be used.
    // This option allows you to specify a different default strategy.
    defaultEnum?: DefaultEnumOption;
    // By default, undefined values will be explicit.
    // This option allows you to specify a different default strategy.
    defaultUndefined?: DefaultUndefinedOption;
};

export type HandlerNewFixtureOptions = Required<NewFixtureOptions>;
