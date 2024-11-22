// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isNullType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const nullHandler: DefaultValueHandler = ({ type, typeChecker, parameter, override, inUndefinedUnion }) => {
    if (!isNullType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'null' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createNull());
};
