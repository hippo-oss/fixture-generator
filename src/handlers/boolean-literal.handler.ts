// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isBooleanLiteralType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const booleanLiteralHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, override, inUndefinedUnion },
) => {
    if (!isBooleanLiteralType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'booleanLiteral' });
        return handlerSuccess(override);
    }

    return typeChecker.typeToString(type) === 'true'
        ? handlerSuccess(factory.createTrue())
        : handlerSuccess(factory.createFalse());

};
