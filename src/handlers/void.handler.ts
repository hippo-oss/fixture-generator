// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isVoidType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const voidHandler: DefaultValueHandler = ({ type, typeChecker, parameter, override, inUndefinedUnion }) => {
    if (!isVoidType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'void' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createVoidZero());
};
