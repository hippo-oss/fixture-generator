// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isUnknownType } from '../fixture-transformer.guards';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const unknownHandler: DefaultValueHandler = ({ type, override }) => {
    if (!isUnknownType(type)) {
        return handlerFail();
    }

    if (override) {
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createStringLiteral('defaultUnknown'));
};
