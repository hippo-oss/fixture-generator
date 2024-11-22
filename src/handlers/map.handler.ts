// eslint-disable-next-line import/no-extraneous-dependencies
import { factory, TypeReference } from 'typescript';
import { overrideUndefinedCheck } from './utils';
import { DefaultValueHandler } from './types';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const mapHandler: DefaultValueHandler = (
    { type, typeChecker, override, currentFile, parameter, inUndefinedUnion, defaultValueFunction, options, level },
) => {
    if (!(type.symbol && type.symbol.getName() === 'Map')) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'map' });
        return handlerSuccess(override);
    }

    const typeArguments = typeChecker.getTypeArguments(type as TypeReference);
    const defaultTypeArgs = typeArguments.map((typeArgument) => defaultValueFunction({
        type: typeArgument, typeChecker, parameter, currentFile, options, level,
    }).data);
    const defaultTypeArgsArray = factory.createArrayLiteralExpression(
        [factory.createArrayLiteralExpression(defaultTypeArgs)],
    );

    return handlerSuccess(factory.createNewExpression(
        factory.createIdentifier('Map'),
        undefined,
        [defaultTypeArgsArray],
    ));
};
