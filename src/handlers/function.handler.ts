// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const functionHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, override, inUndefinedUnion, currentFile, defaultValueFunction, options, level },
) => {
    if (type.getCallSignatures().length === 0) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'function' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createFunctionExpression(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        factory.createBlock([
            factory.createReturnStatement(
                defaultValueFunction({
                    type: type.getCallSignatures()[0].getReturnType(),
                    typeChecker,
                    parameter,
                    currentFile,
                    options,
                    level,
                }).data,
            ),
        ]),
    ));
};
