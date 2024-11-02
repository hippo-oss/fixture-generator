// eslint-disable-next-line import/no-extraneous-dependencies
import { Declaration, factory, Identifier } from 'typescript';
import { DefaultValueHandler } from './types';
import { isSymbolType, isUndefinedType } from '../fixture-transformer.guards';
import { handlerFail, handlerSuccess } from './utils/return.utils';

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-unsafe-enum-comparison
export const undefinedHandler: DefaultValueHandler = ({ type, typeChecker, override, options }) => {
    if (!isUndefinedType(type)) {
        return handlerFail();
    }

    let { defaultUndefined } = options;
    if (override) {
        const overrideType = typeChecker.getTypeAtLocation(override);
        const overrideSymbol = typeChecker.getSymbolAtLocation(override);
        if (!isSymbolType(overrideType) || !overrideSymbol) {
            return handlerSuccess(override);
        }

        const overrideSymbolName = (
            overrideSymbol.valueDeclaration as Declaration & { initializer: Identifier | undefined }
        )?.initializer?.escapedText as string | undefined;

        if (!overrideSymbolName || (
            overrideSymbolName !== 'UndefinedExplicit'
            && overrideSymbolName !== 'UndefinedNothing'
        )) {
            return handlerSuccess(override);
        }

        switch (overrideSymbolName) {
            case 'UndefinedExplicit':
                defaultUndefined = 'explicit';
                break;
            case 'UndefinedNothing':
                defaultUndefined = 'nothing';
                break;
            default: {
                const exhaustiveCheck: never = overrideSymbolName;
                throw new Error(`Unknown symbol name: ${exhaustiveCheck as string}`);
            }
        }
    }

    if (defaultUndefined === 'nothing') {
        return {
            data: factory.createIdentifier('undefined'),
            shouldRemove: true,
        };
    }

    return handlerSuccess(factory.createIdentifier('undefined'));
};
