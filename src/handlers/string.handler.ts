// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { isStringType } from '../fixture-transformer.guards';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

const getDefaultString = (parameter: string | undefined): string => {
    if (!parameter) {
        return 'defaultString';
    }

    const normalizedParameter = parameter
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/\s/g, '');

    return `default${normalizedParameter}`;
};

export const stringHandler: DefaultValueHandler = ({ type, typeChecker, parameter, override, inUndefinedUnion }) => {
    if (!isStringType(type)) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'string' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createStringLiteral(getDefaultString(parameter)));
};
