// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isSymbolType, isUniqueSymbolType } from '../fixture-transformer.guards';
import { getSourceFile, overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';
import { calculateRequirePath } from './utils/calculate.utils';
import { createCallExpressionBlock, createRequireStatement } from './utils/create.utils';

export const symbolHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, override, inUndefinedUnion, currentFile }
) => {
    if (!isSymbolType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'symbol' });
        return handlerSuccess(override);
    }

    if (isUniqueSymbolType(type)) {
        const sourceFile = getSourceFile(type);
        const differentFile = sourceFile !== currentFile;
        if (differentFile) {
            const identifier = `${type.symbol.getName()}File`;
            const relativePath = calculateRequirePath(currentFile, sourceFile);
            const requireStatement = createRequireStatement(identifier, relativePath);
            const symbolIdentifier = factory
                .createPropertyAccessExpression(factory.createIdentifier(identifier), type.symbol.getName());
            const returnStatement = factory.createReturnStatement(symbolIdentifier);
            return handlerSuccess(createCallExpressionBlock([requireStatement, returnStatement]));
        }

        return handlerSuccess(factory.createIdentifier(type.symbol.getName()));
    }

    return handlerSuccess(factory.createIdentifier("Symbol('defaultSymbol')"));
};
