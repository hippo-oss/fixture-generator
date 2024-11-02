// eslint-disable-next-line import/no-extraneous-dependencies
import { factory, isObjectLiteralExpression } from 'typescript';
import { DefaultValueHandler } from './types';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const intersectionHandler: DefaultValueHandler = (
    { type, typeChecker, override, currentFile, parameter, inUndefinedUnion, defaultValueFunction, options, level },
) => {
    if (!type.isIntersection()) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'intersection' });
        const overrideType = typeChecker.getTypeAtLocation(override);
        if (overrideType === type) {
            return handlerSuccess(override);
        }
    }

    const intersectionTypes = type.types;
    const defaultValues = intersectionTypes
        .map((intersectionType) => defaultValueFunction(
            { type: intersectionType, typeChecker, override, parameter, currentFile, options, level },
        ).data);

    for (const defaultValue of defaultValues) {
        if (!isObjectLiteralExpression(defaultValue)) {
            return handlerSuccess(defaultValue);
        }
    }

    const mergedDefaultValues = defaultValues.flatMap((defaultValue) => {
        if (isObjectLiteralExpression(defaultValue)) {
            return defaultValue.properties;
        }
        return [];
    });

    return handlerSuccess(factory.createObjectLiteralExpression(mergedDefaultValues));
};
