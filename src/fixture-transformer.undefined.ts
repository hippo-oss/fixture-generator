export const UndefinedExplicit = Symbol('UndefinedExplicit');
export const UndefinedNothing = Symbol('UndefinedNothing');

export const UndefinedOption = {
    Explicit: UndefinedExplicit,
    Nothing: UndefinedNothing,
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type UndefinedOption = typeof UndefinedOption[keyof typeof UndefinedOption];

export type UndefinedOptionsDeepPartial<T> = {
    [P in keyof T]?: undefined extends T[P]
        ? UndefinedOptionsDeepPartial<T[P]> | UndefinedOption
        : UndefinedOptionsDeepPartial<T[P]>;
};
