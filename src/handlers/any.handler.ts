// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isAnyType } from '../fixture-transformer.guards';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const anyHandler: DefaultValueHandler = ({ type, override }) => {
    if (!isAnyType(type)) {
        return handlerFail();
    }

    if (override) {
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createStringLiteral('defaultAny'));
};
