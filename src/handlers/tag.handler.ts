import { DefaultValueHandler } from './types';
import { handlerFail } from './utils/return.utils';

export const tagHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, inUndefinedUnion, currentFile, defaultValueFunction, override, options, level },
) => {
    if (!type.isIntersection()) {
        return handlerFail();
    }

    for (const intersectionType of type.types) {
        if (intersectionType.getProperty('__defaultFixtureValue')
            && intersectionType.aliasTypeArguments
            && intersectionType.aliasTypeArguments[0]) {

            const defaultValueType = intersectionType.aliasTypeArguments[0];

            return defaultValueFunction({
                type: defaultValueType, typeChecker, override, inUndefinedUnion, currentFile, parameter, options, level,
            });
        }
    }

    return handlerFail();
};
