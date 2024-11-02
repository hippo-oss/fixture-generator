// eslint-disable-next-line import/no-extraneous-dependencies
import { factory, SyntaxKind, TypeReference } from 'typescript';
import { DefaultValueHandler } from './types';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const promiseHandler: DefaultValueHandler = (
    { type, typeChecker, override, currentFile, parameter, inUndefinedUnion, defaultValueFunction, options, level },
) => {
    if (!(type.symbol && type.symbol.getName() === 'Promise')) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'promise' });
        return handlerSuccess(override);
    }

    const typeArguments = typeChecker.getTypeArguments(type as TypeReference);
    const defaultTypeArg = defaultValueFunction({
        type: typeArguments[0], typeChecker, parameter, currentFile, options, level,
    }).data;

    const resolveIdentifier = factory.createIdentifier('resolve');
    const resolveFunction = factory.createArrowFunction(
        undefined,
        undefined,
        [factory.createParameterDeclaration(undefined, undefined, resolveIdentifier)],
        undefined,
        factory.createToken(SyntaxKind.EqualsGreaterThanToken),
        factory.createCallExpression(
            resolveIdentifier,
            undefined,
            [defaultTypeArg],
        ),
    );

    return handlerSuccess(factory.createNewExpression(
        factory.createIdentifier('Promise'),
        undefined,
        [resolveFunction],
    ));
};
