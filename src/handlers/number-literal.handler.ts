// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const numberLiteralHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, override, inUndefinedUnion },
) => {
    if (!type.isNumberLiteral()) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'string' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createNumericLiteral(type.value.toString()));
};
