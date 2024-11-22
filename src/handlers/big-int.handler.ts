// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isBigIntType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const bigIntHandler: DefaultValueHandler = ({ type, typeChecker, parameter, override, inUndefinedUnion }) => {
    if (!isBigIntType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'bigInt' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createBigIntLiteral('9007199254740992n'));
};
