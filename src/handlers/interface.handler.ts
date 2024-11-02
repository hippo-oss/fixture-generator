// eslint-disable-next-line import/no-extraneous-dependencies
import { Expression, factory, Symbol as TypeSymbol, Type, Type as TypeType } from 'typescript';
import { DefaultValueHandler } from './types';
import {
    isAnonymousInterface,
    isInterface,
    isMappedInterface,
    isNumberType,
    isStringType,
    isSymbolType,
    isTransientProperty,
} from '../fixture-transformer.guards';
import { getPropertyAssignmentValue, overrideUndefinedCheck } from './utils';
import { handlerFail, handlerSuccess } from './utils/return.utils';

export const interfaceHandler: DefaultValueHandler = (
    { type, typeChecker, override, parameter, inUndefinedUnion, currentFile, defaultValueFunction, options, level },
) => {
    if (!isInterface(type) && !isAnonymousInterface(type) && !isMappedInterface(type)) {
        return handlerFail();
    }

    const overrideProperties: TypeSymbol[] = [];
    if (override) {
        overrideUndefinedCheck({ typeChecker, override, parameter, inUndefinedUnion, typeString: 'interface' });
        const overrideType = typeChecker.getTypeAtLocation(override);
        if (overrideType === type) {
            return handlerSuccess(override);
        }
        overrideProperties.push(...overrideType.getProperties());
    }

    const properties = typeChecker.getPropertiesOfType(type);

    const propertyAssignments = properties.map((prop) => {
        if (isTransientProperty(prop)) {
            if (prop.declarations && prop.declarations[0]) {
                const declaration = prop.declarations[0] as unknown as TypeType;
                if (declaration.symbol) {
                    // eslint-disable-next-line no-param-reassign
                    prop = declaration.symbol;
                }
            }
        }

        const overrideProperty = overrideProperties.find((overrideProp) => overrideProp.getName() === prop.getName());
        let overrideValueExpression: Expression | undefined;

        if (overrideProperty) {
            if (!overrideProperty.valueDeclaration) {
                throw new Error(`Unable to get value declaration for override property ${prop.getName()}`);
            }

            overrideValueExpression = getPropertyAssignmentValue(overrideProperty.valueDeclaration);
            if (!overrideValueExpression) {
                throw new Error(`Value declaration for override property is of unknown type ${prop.getName()}`);
            }

            overrideProperties.splice(overrideProperties.indexOf(overrideProperty), 1);
        }

        let propType: Type | undefined;
        if (prop.valueDeclaration) {
            propType = typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
        } else {
            propType = typeChecker.getTypeOfSymbol(prop);
        }

        const propValue = defaultValueFunction({
            type: propType,
            typeChecker,
            override: overrideValueExpression,
            parameter: prop.getName(),
            currentFile,
            options,
            level,
        });
        if (propValue.shouldRemove) {
            return undefined;
        }

        return factory.createPropertyAssignment(
            `['${prop.getName()}']`,
            propValue.data,
        );
    }).filter((assignment) => assignment !== undefined);

    const indexSignatures = typeChecker.getIndexInfosOfType(type);
    const indexSignatureMap: Record<'String' | 'Number' | 'Symbol', Type | undefined> = {
        String: undefined,
        Number: undefined,
        Symbol: undefined,
    };
    indexSignatures.forEach((indexSignature) => {
        if (isStringType(indexSignature.keyType)) {
            indexSignatureMap.String = indexSignature.type;
        } else if (isNumberType(indexSignature.keyType)) {
            indexSignatureMap.Number = indexSignature.type;
        } else if (isSymbolType(indexSignature.keyType)) {
            indexSignatureMap.Symbol = indexSignature.type;
        }
    });

    const overrideIndexSignaturePropertyAssignments = overrideProperties.map((overrideProperty) => {
        let indexSignatureType: Type | undefined;
        if (!Number.isNaN(+overrideProperty.getName())) {
            indexSignatureType = indexSignatureMap.Number;
        } else if (overrideProperty.getName()
            .startsWith('__@')) {
            indexSignatureType = indexSignatureMap.Symbol;
        } else {
            indexSignatureType = indexSignatureMap.String;
        }

        if (!indexSignatureType) {
            return undefined;
        }

        if (!overrideProperty.valueDeclaration) {
            throw new Error(`Unable to get value declaration for override property ${overrideProperty.getName()}`);
        }

        const overrideValueExpression = getPropertyAssignmentValue(overrideProperty.valueDeclaration);
        if (!overrideValueExpression) {
            throw new Error(`Value declaration for override property is of unknown type ${overrideProperty.getName()}`);
        }

        const propValue = defaultValueFunction({
            type: indexSignatureType,
            typeChecker,
            override: overrideValueExpression,
            parameter: overrideProperty.getName(),
            currentFile,
            options,
            level,
        });
        if (propValue.shouldRemove) {
            return undefined;
        }
        return factory.createPropertyAssignment(
            `['${overrideProperty.getName()}']`,
            propValue.data,
        );
    }).filter((assignment) => assignment !== undefined);

    return handlerSuccess(factory
        .createObjectLiteralExpression(propertyAssignments.concat(overrideIndexSignaturePropertyAssignments)));
};
