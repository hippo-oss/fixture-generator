// eslint-disable-next-line import/no-extraneous-dependencies
import { Type as TypeType } from 'typescript';
import { DefaultValueHandler } from './types';
import { isDeepPartialOf, isNullType, isUndefinedType } from '../fixture-transformer.guards';
import { canBeUndefined, overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const unionHandler: DefaultValueHandler = (
    { type, typeChecker, override, parameter, currentFile, defaultValueFunction, options, level },
) => {
    if (!type.isUnion()) {
        return handlerFail();
    }

    const inUndefinedUnion = canBeUndefined(type);

    let overrideType: TypeType | undefined;
    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'union' });
        overrideType = typeChecker.getTypeAtLocation(override);
        if (overrideType === type) {
            return handlerSuccess(override);
        }
        if (overrideType.isUnion()) {
            [overrideType] = overrideType.types;
        }
    }

    const baseDefaultValueFunctionOptions = {
        typeChecker,
        override,
        inUndefinedUnion,
        currentFile,
        parameter,
        options,
        level: level + 1,
    };

    for (const unionType of type.types) {
        try {
            if (overrideType === unionType) {
                return defaultValueFunction({ type: unionType, ...baseDefaultValueFunctionOptions });
            }
        } catch { /* try next type in union */ }
    }

    let nullType: TypeType | undefined;
    let undefinedType: TypeType | undefined;

    const levelToBeginShifting = 20;
    const levelsPerShift = 5;

    let shiftedTypes = type.types;
    if (level > levelToBeginShifting) {
        const shift = Math.floor((level - levelToBeginShifting) / levelsPerShift);
        shiftedTypes = [...shiftedTypes.slice(shift), ...shiftedTypes.slice(0, shift)];
    }

    for (const unionType of shiftedTypes) {
        try {
            if (!overrideType || isDeepPartialOf(overrideType, unionType, typeChecker)) {
                if (isNullType(unionType)) {
                    if (options.preferNull || level > levelToBeginShifting) {
                        return defaultValueFunction({ type: unionType, ...baseDefaultValueFunctionOptions });
                    }
                    nullType = unionType;
                } else if (isUndefinedType(unionType)) {
                    if (options.preferUndefined || level > levelToBeginShifting) {
                        return defaultValueFunction({ type: unionType, ...baseDefaultValueFunctionOptions });
                    }
                    undefinedType = unionType;
                } else {
                    return defaultValueFunction({ type: unionType, ...baseDefaultValueFunctionOptions });
                }
            }
        } catch { /* try next type in union */ }
    }

    if (nullType) {
        return defaultValueFunction({ type: nullType, ...baseDefaultValueFunctionOptions });
    }

    if (undefinedType) {
        return defaultValueFunction({ type: undefinedType, ...baseDefaultValueFunctionOptions });
    }

    for (const unionType of shiftedTypes) {
        try {
            return defaultValueFunction({ type: unionType, ...baseDefaultValueFunctionOptions });
        } catch { /* try next type in union */ }
    }

    throw new Error(
        `Unable to get default value in fixture for any type in the union ${typeChecker.typeToString(type)}`,
    );
};
