// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const stringLiteralHandler: DefaultValueHandler = (
    { type, typeChecker, parameter, override, inUndefinedUnion },
) => {
    if (!type.isStringLiteral()) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'stringLiteral' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createStringLiteral(type.value));
};
