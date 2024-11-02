// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isBigIntLiteralType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const bigIntLiteralHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, override, inUndefinedUnion },
) => {
    if (!(isBigIntLiteralType(type))) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'bigIntLiteral' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createBigIntLiteral(type.value));
};
