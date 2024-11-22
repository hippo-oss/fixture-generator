// eslint-disable-next-line import/no-extraneous-dependencies
import { factory } from 'typescript';
import { DefaultValueHandler } from './types';
import { overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const dateHandler: DefaultValueHandler = ({ type, typeChecker, parameter, override, inUndefinedUnion }) => {
    if (!(type.symbol && type.symbol.getName() === 'Date')) {
        return handlerFail();
    }

    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'date' });
        return handlerSuccess(override);
    }

    return handlerSuccess(factory.createNewExpression(
        factory.createIdentifier('Date'),
        undefined,
        [
            factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createIdentifier('Date'),
                    factory.createIdentifier('UTC'),
                ),
                undefined,
                [
                    factory.createNumericLiteral('1999'),
                    factory.createNumericLiteral('10'),
                    factory.createNumericLiteral('1'),
                ],
            ),
        ],
    ));
};
